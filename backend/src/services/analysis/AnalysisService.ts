// backend/src/services/AnalysisService.ts

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
} from '@prisma/client';
import { Matrix } from 'ml-matrix';
import kmeans from 'ml-kmeans';
import PCA from 'ml-pca';
import { createLogger } from '../../utils/logger.ts';
import { log } from 'console';

const logger = createLogger('ANALYSIS SERVICE');

interface MoveContext {
    type: MoveType;
    source: MoveSource;
    wasUsed?: boolean; // 是否實際上場
    usedByBothTeams?: boolean; // 雙方皆使用 (for Utility)
}

interface WeightContext {
    pick: number;
    ban: number;
    utility: number;
    randomPick: number;
    randomBan: number;
    randomUtility: number;
    pickNotUsed: number;
    utilityUsedOneSide: number;
    utilityUsedBothSides: number;
}

interface TacticalCoefficients {
    base: {
        pick: number;
        ban: number;
        utility: number;
    };
    randomFactor: {
        pick: number;
        ban: number;
        utility: number;
        utilityUsed: number;
    };
    pickNotUsedFactor: number;
    utilityUsed: {
        oneSide: number;
        bothSides: number;
    };
    clampRange: [number, number];
}

// 🧮 預設係數
export const DEFAULT_TACTICAL_COEFFICIENTS: TacticalCoefficients = {
    base: { pick: 1.0, ban: 0.75, utility: 0.5 },
    randomFactor: {
        pick: 0.6, // 隨機 Pick 保留部分策略價值
        ban: 0.4, // 隨機 Ban 幾乎無意圖
        utility: 0.3, // 隨機 Utility 基礎值
        utilityUsed: 0.5, // 隨機 Utility 但被使用，衰減 50%
    },
    pickNotUsedFactor: 0.35, // 被替代的 Pick 價值衰減
    utilityUsed: {
        oneSide: 1.0,
        bothSides: 1.5,
    },
    clampRange: [0, 1.5],
};

export default class AnalysisService {
    constructor(private prisma: PrismaClient) {}

    getWeightContext(moveContext: MoveContext): WeightContext {
        const weightContext: WeightContext = {
            pick: 0,
            ban: 0,
            utility: 0,
            randomPick: 0,
            randomBan: 0,
            randomUtility: 0,
            pickNotUsed: 0,
            utilityUsedOneSide: 0,
            utilityUsedBothSides: 0,
        };
        const { type, source, wasUsed, usedByBothTeams } = moveContext;
        const isRandom = source === MoveSource.Random;
        switch (type) {
            case MoveType.Ban:
                weightContext.ban += 1;
                if (isRandom) {
                    weightContext.randomBan += 1;
                }
                break;
            case MoveType.Pick:
                weightContext.pick += 1;
                if (isRandom) {
                    weightContext.randomPick += 1;
                }
                if (!wasUsed) {
                    weightContext.pickNotUsed += 1;
                }
                break;
            case MoveType.Utility:
                weightContext.utility += 1;
                if (isRandom) {
                    weightContext.randomUtility += 1;
                }
                if (usedByBothTeams) {
                    weightContext.utilityUsedBothSides += 1;
                } else {
                    weightContext.utilityUsedOneSide += 1;
                }
                break;
            default:
                const _exhaustiveCheck: never = type;
                throw new Error(`Unhandled MoveType: ${_exhaustiveCheck}`);
        }
        return weightContext;
    }

    calculateTacticalWeight(weightContext: WeightContext, coefficients: TacticalCoefficients = DEFAULT_TACTICAL_COEFFICIENTS): number {
        if (weightContext.ban > 0) return this.calcBanWeight(weightContext, coefficients);
        if (weightContext.pick > 0) return this.calcPickWeight(weightContext, coefficients);
        if (weightContext.utility > 0) return this.calcUtilityWeight(weightContext, coefficients);
        return 0;
    }

    // 🧱 Ban 權重邏輯
    private calcBanWeight(ctx: WeightContext, c: TacticalCoefficients): number {
        let weight = c.base.ban;
        const isRandom = ctx.randomBan > 0;
        if (isRandom) {
            const rf = 0.05; // 可選：微小平滑，防止極端
            weight = weight * (1 - rf) + c.base.ban * rf;
        }
        return Math.max(c.clampRange[0] ?? 0, Math.min(weight, c.clampRange[1] ?? 1.5));
    }

    // 🧱 Pick 權重邏輯
    private calcPickWeight(ctx: WeightContext, c: TacticalCoefficients): number {
        let weight = c.base.pick;
        const isRandom = ctx.randomPick > 0;

        // 被隨機抽中但沒被使用 → 降權
        if (isRandom && ctx.pickNotUsed === 0) {
            weight *= c.randomFactor.pick;
        }

        // 被替代 (not used)
        if (ctx.pickNotUsed > 0) {
            weight *= c.pickNotUsedFactor;
        }

        return Math.max(c.clampRange[0] ?? 0, Math.min(weight, c.clampRange[1] ?? 1.5));
    }

    // 🧱 Utility 權重邏輯
    private calcUtilityWeight(ctx: WeightContext, c: TacticalCoefficients): number {
        const isRandom = ctx.randomUtility > 0;
        const usedBoth = ctx.utilityUsedBothSides > 0;
        const usedOne = ctx.utilityUsedOneSide > 0;

        // 基礎
        let weight = c.base.utility;

        // 被使用 → 提升價值
        if (usedBoth || usedOne) {
            const usedWeight = usedBoth ? c.utilityUsed.bothSides : c.utilityUsed.oneSide;
            if (isRandom) {
                const rf = c.randomFactor.utilityUsed ?? c.randomFactor.utility;
                weight = usedWeight * (1 - rf) + c.base.utility * rf; // 平滑，不重懲
            } else {
                weight = usedWeight;
            }
        }
        // 未使用但隨機抽中 → 輕微降權
        else if (isRandom) {
            const rf = c.randomFactor.utility ?? 0.8;
            weight = weight * (1 - rf) + c.base.utility * rf;
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
        const weightContextMap = new Map<string, WeightContext>();
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
                pick: 0,
                ban: 0,
                utility: 0,
                randomPick: 0,
                randomBan: 0,
                randomUtility: 0,
                pickNotUsed: 0,
                utilityUsedOneSide: 0,
                utilityUsedBothSides: 0,
            };
            for (const k of Object.keys(prevCtx) as (keyof WeightContext)[]) {
                prevCtx[k] += weightContext[k];
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

    async getMeta() {
        const metaPickCharacters = await this.prisma.matchMove.groupBy({
            by: ['characterKey'],
            where: { type: 'Pick' },
            _count: true,
            orderBy: { _count: { characterKey: 'desc' } },
        });

        const metaBanCharacters = await this.prisma.matchMove.groupBy({
            by: ['characterKey'],
            where: { type: 'Ban' },
            _count: true,
            orderBy: { _count: { characterKey: 'desc' } },
        });

        const metaUtilityCharacters = await this.prisma.matchMove.groupBy({
            by: ['characterKey'],
            where: { type: 'Utility' },
            _count: true,
            orderBy: { _count: { characterKey: 'desc' } },
        });

        return {
            metaPickCharacters,
            metaBanCharacters,
            metaUtilityCharacters,
        };
    }

    async getBanPickUtilityStats() {
        const result = await this.prisma.matchMove.groupBy({
            by: ['characterKey', 'type'],
            _count: true,
        });

        const stats: Record<string, { pick: number; ban: number; utility: number }> = {};

        for (const row of result) {
            const key = row.characterKey;
            stats[key] ??= { pick: 0, ban: 0, utility: 0 };

            if (row.type === 'Ban') stats[key].ban += row._count;
            if (row.type === 'Pick') stats[key].pick += row._count;
            if (row.type === 'Utility') stats[key].utility += row._count;
        }

        return stats;
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

    async getSynergy() {
        const usages = await this.prisma.matchTacticalUsage.findMany({
            include: {
                teamMember: {
                    include: {
                        team: true, // matchTeamId
                    },
                },
            },
        });

        // matchTeamId → 角色列表
        const teamToCharacters: Record<number, string[]> = {};

        for (const u of usages) {
            const teamId = u.teamMember.teamId;
            if (!teamToCharacters[teamId]) teamToCharacters[teamId] = [];
            teamToCharacters[teamId].push(u.characterKey);
        }

        // 建 Synergy Matrix
        const synergy: Record<string, Record<string, number>> = {};

        for (const characters of Object.values(teamToCharacters)) {
            const uniq = [...new Set(characters)]; // 避免同人重複
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
        logger.info('synergy =\n' + JSON.stringify(synergy, null, 2));

        return synergy;
    }

    async getArchetypes(k = 4) {
        const synergy = await this.getSynergy();
        const chars = Object.keys(synergy).sort();

        // → NxN Matrix
        const vectors = chars.map((char) => chars.map((other) => synergy[char]?.[other] ?? 0));

        let matrix = new Matrix(vectors);

        // 計算每列平均 & 標準差（回傳 number[]）
        const rowMeans = matrix.mean('row');
        const rowStds = matrix.standardDeviation('row');

        // 轉成 row 向量（matrix）
        const meanMatrix = Matrix.rowVector(rowMeans);
        const stdMatrix = Matrix.rowVector(rowStds);

        // ✅ 逐行標準化： (matrix - mean) / std
        const colMeans = matrix.mean('column');
        const colStds = matrix.standardDeviation('column');

        matrix = matrix.subColumnVector(Matrix.columnVector(colMeans)).divColumnVector(Matrix.columnVector(colStds));

        // @ts-ignore
        const result = kmeans.kmeans(matrix.to2DArray(), k, { initialization: 'kmeans++' });

        return chars.map((characterKey, index) => ({
            characterKey,
            clusterId: result.clusters[index],
        }));
    }

    async getArchetypeMap(k = 4) {
        const synergy = await this.getSynergy();
        const chars = Object.keys(synergy).sort();

        const vectors = chars.map((char) => chars.map((other) => synergy[char]?.[other] ?? 0));

        let matrix = new Matrix(vectors);

        const colMeans = matrix.mean('column');
        const colStds = matrix.standardDeviation('column');

        // ✅ 標準化（這一步很重要，否則 PCA 會被高出場率角色主導）
        matrix = matrix.subColumnVector(Matrix.columnVector(colMeans)).divColumnVector(Matrix.columnVector(colStds));

        // @ts-ignore
        const pca = new PCA.PCA(matrix.to2DArray());
        const projected = pca.predict(matrix.to2DArray(), { nComponents: 2 }).to2DArray();

        // ✅ Cluster 標記
        const clusters = await this.getArchetypes(k);

        return chars.map((char, i) => ({
            characterKey: char,
            clusterId: clusters.find((c) => c.characterKey === char)!.clusterId,
            x: projected[i][0],
            y: projected[i][1],
        }));
    }
}
