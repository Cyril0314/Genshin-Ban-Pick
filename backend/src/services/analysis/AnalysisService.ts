// backend/src/services/analysis/AnalysisService.ts

import { PrismaClient } from '@prisma/client/extension';
import {
    Match,
    MatchTeam,
    MatchTeamMember,
    MatchTacticalUsage,
    MatchMove,
    MoveType,
    MoveSource,
    RandomMoveContext,
    Rarity,
    Element,
    Weapon,
    Region,
    ModelType,
    CharacterRole,
    Wish,
    Prisma,
} from '@prisma/client';
import { Matrix } from 'ml-matrix';
import kmeans from 'ml-kmeans';
import PCA from 'ml-pca';
import { UndirectedGraph } from 'graphology';
import louvain from 'graphology-communities-louvain';
// @ts-ignore
import modularity from 'graphology-metrics/graph/modularity';
import { createLogger } from '../../utils/logger.ts';
import { DataNotFoundError } from '../../errors/AppError.ts';
import { normalizeSynergy, SynergyMatrix } from './synergyNormalization.ts';
import { IBanContext, IPickContext, IUtilityContext, IWeightContext } from './types/IWeightContext.ts';
import { ITacticalCoefficients, DEFAULT_TACTICAL_COEFFICIENTS } from './types/ITacticalCoefficients.ts';
import { SynergyMode } from './types/SynergyMode.ts';
import { IRawTacticalUsage } from './types/IRawTacticalUsage.ts';
import { ISynergyMatrix } from './types/ISynergyMatrix.ts';
import { ICommunityScanResult } from './types/ICommunityScanResult.ts';
import { computeBridgeScores } from './computeBridgeScores.ts';

const logger = createLogger('ANALYSIS SERVICE');

interface IMoveContext {
    type: MoveType;
    source: MoveSource;
    wasUsed?: boolean; // 是否實際上場
    usedByBothTeams?: boolean; // 雙方皆使用 (for Utility)
}

export default class AnalysisService {
    constructor(private prisma: PrismaClient) {}

    getWeightContext(moveContext: IMoveContext): IWeightContext {
        const weightContext: IWeightContext = {
            pick: {
                total: 0,
                manualUsed: 0,
                manualNotUsed: 0,
                randomUsed: 0,
                randomNotUsed: 0,
            },
            ban: {
                total: 0,
                manual: 0,
                random: 0,
            },
            utility: {
                total: 0,
                manualNotUsed: 0,
                manualUsedOneSide: 0,
                manualUsedBothSides: 0,
                randomNotUsed: 0,
                randomUsedOneSide: 0,
                randomUsedBothSides: 0,
            },
        };
        const { type, source, wasUsed, usedByBothTeams } = moveContext;
        const isRandom = source === MoveSource.Random;
        switch (type) {
            case MoveType.Ban:
                weightContext.ban.total++;
                if (isRandom) weightContext.ban.random++;
                else weightContext.ban.manual++;
                break;
            case MoveType.Pick:
                weightContext.pick.total++;
                if (!isRandom && wasUsed) weightContext.pick.manualUsed++;
                else if (!isRandom && !wasUsed) weightContext.pick.manualNotUsed++;
                else if (isRandom && wasUsed) weightContext.pick.randomUsed++;
                else if (isRandom && !wasUsed) weightContext.pick.randomNotUsed++;
                break;
            case MoveType.Utility:
                weightContext.utility.total++;
                if (!isRandom && !wasUsed) weightContext.utility.manualNotUsed++;
                else if (!isRandom && wasUsed && !usedByBothTeams) weightContext.utility.manualUsedOneSide++;
                else if (!isRandom && wasUsed && usedByBothTeams) weightContext.utility.manualUsedBothSides++;
                else if (isRandom && !wasUsed) weightContext.utility.randomNotUsed++;
                else if (isRandom && wasUsed && !usedByBothTeams) weightContext.utility.randomUsedOneSide++;
                else if (isRandom && wasUsed && usedByBothTeams) weightContext.utility.randomUsedBothSides++;

                break;
            default:
                const _exhaustiveCheck: never = type;
                throw new Error(`Unhandled MoveType: ${_exhaustiveCheck}`);
        }
        return weightContext;
    }

    calculateTacticalWeight(weightContext: IWeightContext, coefficients: ITacticalCoefficients = DEFAULT_TACTICAL_COEFFICIENTS): number {
        if (weightContext.ban.total > 0) return this.calcBanWeight(weightContext.ban, coefficients);
        if (weightContext.pick.total > 0) return this.calcPickWeight(weightContext.pick, coefficients);
        if (weightContext.utility.total > 0) return this.calcUtilityWeight(weightContext.utility, coefficients);
        return 0;
    }

    // 🧱 Ban 權重邏輯
    private calcBanWeight(ctx: IBanContext, c: ITacticalCoefficients): number {
        let weight = c.ban.base;
        const isRandom = ctx.random > 0;
        if (isRandom) {
            const rf = c.ban.randomFactor;
            weight = weight * (1 - rf) + c.ban.random * rf;
        }
        return Math.max(c.clampRange[0] ?? 0, Math.min(weight, c.clampRange[1] ?? 1.5));
    }

    // 🧱 Pick 權重邏輯
    private calcPickWeight(ctx: IPickContext, c: ITacticalCoefficients): number {
        let weight = c.pick.base;

        const isRandom = ctx.randomUsed + ctx.randomNotUsed > 0;
        if (isRandom) {
            const rf = c.pick.randomFactor;
            weight = weight * (1 - rf) + c.pick.random * rf;
        }

        const isNotUsed = ctx.manualNotUsed + ctx.randomNotUsed > 0;
        if (isNotUsed) {
            weight *= c.pick.notUsedFactor;
        }

        return Math.max(c.clampRange[0] ?? 0, Math.min(weight, c.clampRange[1] ?? 1.5));
    }

    // 🧱 Utility 權重邏輯
    private calcUtilityWeight(ctx: IUtilityContext, c: ITacticalCoefficients): number {
        const isRandom = ctx.randomNotUsed + ctx.randomUsedOneSide + ctx.randomUsedBothSides > 0;
        const usedOneSide = ctx.manualUsedOneSide + ctx.randomUsedOneSide > 0;
        const usedBothSides = ctx.manualUsedBothSides + ctx.randomUsedBothSides > 0;

        let weight = c.utility.base;

        if (isRandom) {
            const rf = c.utility.randomFactor;
            weight = weight * (1 - rf) + c.utility.random * rf;
        }
        if (usedOneSide) {
            weight *= c.utility.usedOneSideFactor;
        } else if (usedBothSides) {
            weight *= c.utility.usedBothSidesFactor;
        }
        return Math.max(c.clampRange[0] ?? 0, Math.min(weight, c.clampRange[1] ?? 1.5));
    }

    async getTacticalUsages() {
        const matches = await this.prisma.match.findMany({
            select: { id: true, createdAt: true },
        });

        const matchCount = matches.length;
        const moves = await this.prisma.matchMove.findMany({
            select: {
                id: true,
                type: true,
                source: true,
                matchId: true,
                characterKey: true,
                match: {
                    select: {
                        id: true,
                        createdAt: true,
                        teams: {
                            select: { id: true, name: true },
                        },
                    },
                },
                character: {
                    select: { releaseDate: true },
                },
                randomMoveContext: true,
            },
        });

        const usages = await this.prisma.matchTacticalUsage.findMany({
            select: {
                characterKey: true,
                teamMember: { select: { team: { select: { matchId: true } } } },
            },
        });

        const usedSet = new Set(usages.map((u: any) => `${u.teamMember.team.matchId}:${u.characterKey}`));
        const usageCountByMatch = new Map<string, number>();
        for (const u of usages) {
            const key = `${u.teamMember.team.matchId}:${u.characterKey}`;
            usageCountByMatch.set(key, (usageCountByMatch.get(key) ?? 0) + 1);
        }
        const weights = new Map<string, number>();
        const weightContextMap = new Map<string, IWeightContext>();
        const releaseMap = new Map<string, Date | null>();

        for (const move of moves) {
            let w = 0;
            const key = move.characterKey;
            const matchId = move.matchId;
            const matchDate = move.match.createdAt;
            const releaseDate = move.character.releaseDate;
            const source = move.source;
            const wasUsed = usedSet.has(`${matchId}:${key}`);
            const usedCount = usageCountByMatch.get(`${matchId}:${key}`) ?? 0;
            const usedByBothTeams = usedCount >= 2;

            releaseMap.set(key, releaseDate ?? null);

            // 跳過未釋出的角色
            if (releaseDate && releaseDate > matchDate) continue;

            const weightContext = this.getWeightContext({
                type: move.type,
                source: source,
                wasUsed,
                usedByBothTeams,
            });
            const weight = this.calculateTacticalWeight(weightContext);

            const prevWeight = weights.get(key) ?? 0;
            weights.set(key, prevWeight + weight);

            const prevCtx = weightContextMap.get(key) ?? {
                pick: {
                    total: 0,
                    manualUsed: 0,
                    manualNotUsed: 0,
                    randomUsed: 0,
                    randomNotUsed: 0,
                },
                ban: {
                    total: 0,
                    manual: 0,
                    random: 0,
                },
                utility: {
                    total: 0,
                    manualNotUsed: 0,
                    manualUsedOneSide: 0,
                    manualUsedBothSides: 0,
                    randomNotUsed: 0,
                    randomUsedOneSide: 0,
                    randomUsedBothSides: 0,
                },
            };
            for (const type of Object.keys(weightContext) as (keyof IWeightContext)[]) {
                const subCtx = weightContext[type];
                const prevSub = prevCtx[type];

                for (const field of Object.keys(subCtx) as (keyof typeof subCtx)[]) {
                    // @ts-ignore: dynamic numeric add
                    prevSub[field] = (prevSub[field] ?? 0) + (subCtx[field] ?? 0);
                }
            }

            weightContextMap.set(key, prevCtx);
        }

        const effectiveMatchCount = new Map<string, number>();
        const sortedMatches = matches.sort((a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime());

        for (const [key, releaseDate] of releaseMap.entries()) {
            if (!releaseDate) {
                effectiveMatchCount.set(key, matchCount);
                continue;
            }
            const validCount = sortedMatches.findIndex((m: any) => m.createdAt >= releaseDate);
            // 如果找不到代表全可用
            effectiveMatchCount.set(key, validCount === -1 ? matchCount : matchCount - validCount);
        }

        // 4️⃣ 正規化成 usage 值
        const results = Array.from(weights.entries()).map(([characterKey, totalWeight]) => {
            const validMatchCount = effectiveMatchCount.get(characterKey) ?? 0;
            const safeValidMatchCount = Math.max(validMatchCount, 1);
            const globalUsage = totalWeight / matchCount;
            const effectiveUsage = totalWeight / safeValidMatchCount;

            const priorCount = 0; // 先不假設前面有 pseudo
            const priorUsage = globalUsage;
            const adjustedUsage = (effectiveUsage * validMatchCount + priorUsage * priorCount) / (validMatchCount + priorCount);
            const stabilityFactor = 1 - Math.exp(-validMatchCount / 30); // 0 ~ 1
            const tacticalUsage = globalUsage * stabilityFactor + adjustedUsage * (1 - stabilityFactor);
            const context = weightContextMap.get(characterKey);
            return {
                characterKey,
                tacticalUsage,
                globalUsage,
                effectiveUsage,
                validMatchCount,
                context,
            };
        });

        return results.sort((a, b) => b.tacticalUsage - a.tacticalUsage);
    }

    async getPreference() {
        const usages = await this.prisma.matchTacticalUsage.findMany({
            include: {
                teamMember: true, // 拿到 name, memberRef, guestRef
            },
        });

        // 計算偏好
        const preferenceMap: Record<string, Record<string, number>> = {};

        for (const u of usages) {
            const playerName = u.teamMember.name;
            const charKey = u.characterKey;

            if (!preferenceMap[playerName]) preferenceMap[playerName] = {};
            if (!preferenceMap[playerName][charKey]) preferenceMap[playerName][charKey] = 0;

            preferenceMap[playerName][charKey]++;
        }

        // 排序成曲線
        const playerPreferences = Object.entries(preferenceMap).map(([player, table]) => {
            const sorted = Object.entries(table)
                .sort((a, b) => b[1] - a[1]) // 次數降序
                .map(([characterKey, count]) => ({ characterKey, count }));
            return { player, characters: sorted };
        });

        // console.dir(playerPreferences)
        logger.info('playerPreferences =\n' + JSON.stringify(playerPreferences, null, 2));

        return playerPreferences;
    }

    async getSynergy(mode: SynergyMode = 'setup') {
        const raw = await this.fetchRawTacticalUsages();
        const groups = this.buildCooccurrenceGroups(raw, mode);
        const synergy = this.buildSynergyMatrix(groups);
        return synergy;
    }

    async getArchetypes() {
        const synergy = await this.getSynergy();

        const k = await this.findBestClusterCount();
        const { chars, matrix } = this.normalizeSynergyMatrix(synergy);
        const clusterIds = this.clusterCharacters(matrix, k);

        return chars.map((characterKey, i) => ({
            characterKey,
            clusterId: clusterIds[i],
        }));
    }

    async getArchetypeMap() {
        const synergy = await this.getSynergy();

        const k = await this.findBestClusterCount();
        const { chars, matrix } = this.normalizeSynergyMatrix(synergy);
        const projected = this.projectCharacters2D(matrix, 2);
        const clusterIds = this.clusterCharacters(matrix, k);

        const clusterMedoids = this.computeClusterMedoids(chars, clusterIds, projected);
        console.log(`clusterMedoids`, clusterMedoids);

        return chars.map((char, i) => ({
            characterKey: char,
            clusterId: clusterIds[i],
            x: projected[i][0],
            y: projected[i][1],
        }));
    }

    async getBridgeScores() {
        const graph = await this.buildSynergyGraph();
        const synergy = await this.getSynergy();

        const { chars, matrix } = this.normalizeSynergyMatrix(synergy);
        const projected = this.projectCharacters2D(matrix, 2);
        const clusterIds = this.clusterCharacters(matrix, await this.findBestClusterCount());

        return computeBridgeScores(graph, projected, chars, clusterIds);
    }

    async getCharacterMap() {
        type Character = Prisma.CharacterGetPayload<{
            select: {
                key: true;
                name: true;
                rarity: true;
                element: true;
                weapon: true;
                region: true;
                modelType: true;
                role: true;
                wish: true;
                releaseDate: true;
            };
        }>;
        try {
            const characters: Character[] = await this.prisma.character.findMany({
                select: {
                    key: true,
                    name: true,
                    rarity: true,
                    element: true,
                    weapon: true,
                    region: true,
                    modelType: true,
                    role: true,
                    wish: true,
                    releaseDate: true,
                },
                orderBy: { id: 'asc' }, // 可按需求排序
            });
            if (!characters || characters.length === 0) {
                throw new DataNotFoundError();
            }
            return Object.fromEntries(characters.map((character) => [character.key, character]));
        } catch (error) {
            console.error('[CharacterService] Failed to fetch characters:', error);
            throw new DataNotFoundError();
        }
    }

    private async fetchRawTacticalUsages(): Promise<IRawTacticalUsage[]> {
        type MatchTacticalUsage = Prisma.MatchTacticalUsageGetPayload<{
            select: {
                setupNumber: true;
                characterKey: true;
                teamMember: {
                    select: {
                        teamId: true;
                        team: {
                            select: {
                                matchId: true;
                            };
                        };
                    };
                };
            };
        }>;

        const rows: MatchTacticalUsage[] = await this.prisma.matchTacticalUsage.findMany({
            select: {
                setupNumber: true,
                characterKey: true,
                teamMember: {
                    select: {
                        teamId: true,
                        team: {
                            select: { matchId: true },
                        },
                    },
                },
            },
        });

        return rows.map((r) => ({
            matchId: r.teamMember.team.matchId,
            teamId: r.teamMember.teamId,
            setupNumber: r.setupNumber,
            characterKey: r.characterKey,
        }));
    }

    private getCooccurrenceGroupKey(rawTacticalUsage: IRawTacticalUsage, mode: SynergyMode): string {
        switch (mode) {
            case 'match':
                // 一場比賽當作一個 group
                return `${rawTacticalUsage.matchId}`;
            case 'team':
                // 同一個隊伍（整體）當作一個 group
                return `${rawTacticalUsage.teamId}`;
            case 'setup':
                // 一場比賽 + 一隊 + 一個編成（setup）當作一個 group
                return `${rawTacticalUsage.matchId}:${rawTacticalUsage.teamId}:${rawTacticalUsage.setupNumber}`;
        }
    }

    private buildCooccurrenceGroups(usages: IRawTacticalUsage[], mode: SynergyMode): Record<string, string[]> {
        const groups: Record<string, string[]> = {};

        for (const u of usages) {
            const key = this.getCooccurrenceGroupKey(u, mode);
            if (!groups[key]) groups[key] = [];
            groups[key].push(u.characterKey);
        }

        return groups;
    }

    private buildSynergyMatrix(groups: Record<string, string[]>): ISynergyMatrix {
        const synergy: ISynergyMatrix = {};

        for (const characters of Object.values(groups)) {
            // 去重，避免同一 group 同一角色被算兩次
            const uniq = [...new Set(characters)];

            for (let i = 0; i < uniq.length; i++) {
                for (let j = i + 1; j < uniq.length; j++) {
                    const a = uniq[i];
                    const b = uniq[j];

                    synergy[a] ??= {};
                    synergy[b] ??= {};

                    synergy[a][b] = (synergy[a][b] || 0) + 1;
                    synergy[b][a] = (synergy[b][a] || 0) + 1;
                }
            }
        }

        return synergy;
    }

    private normalizeSynergyMatrix(synergy: ISynergyMatrix): { chars: string[]; matrix: Matrix } {
        const chars = Object.keys(synergy).sort();

        // 1) 轉成 NxN raw matrix
        let matrix = new Matrix(chars.map((a) => chars.map((b) => synergy[a]?.[b] ?? 0)));

        // 2) 計算 column 平均、標準差
        const colMeans = matrix.mean('column');
        const colStds = matrix.standardDeviation('column');

        const colMeanVec = Matrix.columnVector(colMeans);
        const colStdVec = Matrix.columnVector(colStds);

        // 3) 標準化：Z = (M - mean) / std
        matrix = matrix.subColumnVector(colMeanVec).divColumnVector(colStdVec);

        return { chars, matrix: matrix };
    }

    private projectCharacters2D(matrix: Matrix, nComponents = 2): number[][] {
        // @ts-ignore
        const pca = new PCA.PCA(matrix.to2DArray());
        const projected = pca.predict(matrix.to2DArray(), { nComponents }).to2DArray();

        return projected;
    }

    private clusterCharacters(matrix: Matrix, k: number): number[] {
        // @ts-ignore
        const result = kmeans.kmeans(matrix.to2DArray(), k, {
            initialization: 'kmeans++',
        });
        return result.clusters; // 長度 = chars.length
    }

    private async buildSynergyGraph(): Promise<UndirectedGraph> {
        const characterMap = await this.getCharacterMap();
        const synergy = await this.getSynergy();
        const graph = new UndirectedGraph();

        const normSynergy = normalizeSynergy(synergy, 'jaccard');

        const chars = Object.keys(synergy);
        for (const char of chars) graph.addNode(char, characterMap[char]);

        for (const a of chars) {
            for (const b of chars) {
                if (a >= b) continue; // 避免重複兩邊（字典序避免）
                const w = normSynergy[a]?.[b] ?? 0;
                if (w > 0) {
                    graph.addUndirectedEdgeWithKey(`${a}-${b}`, a, b, { weight: w });
                }
            }
        }

        return graph;
    }

    private async findBestClusterCount(resolutions: number[] = [0.5, 0.8, 1.0, 1.2, 1.5]): Promise<number> {
        const graph = await this.buildSynergyGraph();
        const scan = this.runLouvainOnGraph(graph, resolutions);
        const best = scan.reduce((a, b) => (a.modularity > b.modularity ? a : b));
        return best.clusters;
    }

    private runLouvainOnGraph(graph: UndirectedGraph, resolutions: number[]): ICommunityScanResult[] {
        const result: ICommunityScanResult[] = [];

        for (const gamma of resolutions) {
            // @ts-ignore: graphology-communities-louvain 型別 issue
            const mapping = louvain(graph, {
                resolution: gamma,
                nodeCommunityAttribute: 'community',
            });
            for (const node of graph.nodes()) {
                graph.setNodeAttribute(node, 'community', mapping[node]);
            }
            const clusters = new Set(Object.values(mapping)).size;
            const Q = modularity(graph, mapping);

            result.push({
                resolution: gamma,
                clusters,
                modularity: Q,
            });
        }

        return result;
    }

    computeClusterMedoids(chars: string[], clusterIds: number[], pcaPoints: number[][]) {
        const clusters: Record<number, number[]> = {};

        // 1) 分群
        clusterIds.forEach((cid, i) => {
            if (!clusters[cid]) clusters[cid] = [];
            clusters[cid].push(i);
        });

        const medoids: Record<number, { characterKey: string; x: number; y: number }> = {};

        // 2) 對每群分別計算 medoid
        for (const [cidStr, indices] of Object.entries(clusters)) {
            const cid = Number(cidStr);

            let bestIndex = -1;
            let bestScore = Infinity;

            // 對群內每個角色計算「與其他成員的距離總和」
            for (const i of indices) {
                let totalDist = 0;
                const [xi, yi] = pcaPoints[i];

                for (const j of indices) {
                    if (i === j) continue;

                    const [xj, yj] = pcaPoints[j];
                    const dx = xi - xj;
                    const dy = yi - yj;
                    totalDist += Math.sqrt(dx * dx + dy * dy);
                }

                if (totalDist < bestScore) {
                    bestScore = totalDist;
                    bestIndex = i;
                }
            }

            medoids[cid] = {
                characterKey: chars[bestIndex],
                x: pcaPoints[bestIndex][0],
                y: pcaPoints[bestIndex][1],
            };
        }

        return medoids;
    }
}
