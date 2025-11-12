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
    Prisma,
} from '@prisma/client';
import { Matrix } from 'ml-matrix';
import kmeans from 'ml-kmeans';
import PCA from 'ml-pca';
import { createLogger } from '../../utils/logger.ts';
import { log } from 'console';

const logger = createLogger('ANALYSIS SERVICE');

interface IMoveContext {
    type: MoveType;
    source: MoveSource;
    wasUsed?: boolean; // 是否實際上場
    usedByBothTeams?: boolean; // 雙方皆使用 (for Utility)
}

interface IPickContext {
    total: number;
    manualUsed: number;
    manualNotUsed: number;
    randomUsed: number;
    randomNotUsed: number;
}

interface IBanContext {
    total: number;
    manual: number;
    random: number;
}

interface IUtilityContext {
    total: number;
    manualNotUsed: number;
    manualUsedOneSide: number;
    manualUsedBothSides: number;
    randomNotUsed: number;
    randomUsedOneSide: number;
    randomUsedBothSides: number;
}

interface IWeightContext {
    pick: IPickContext;
    ban: IBanContext;
    utility: IUtilityContext;
}

interface IPickCoefficients {
    base: number;
    random: number;
    randomFactor: number;
    notUsedFactor: number;
}

interface IBanCoefficients {
    base: number;
    random: number;
    randomFactor: number;
}

interface IUtilityCoefficients {
    base: number;
    random: number;
    randomFactor: number;
    usedOneSideFactor: number;
    usedBothSidesFactor: number;
}

interface ITacticalCoefficients {
    pick: IPickCoefficients;
    ban: IBanCoefficients;
    utility: IUtilityCoefficients;
    clampRange: [number, number];
}

// 🧮 預設係數
export const DEFAULT_TACTICAL_COEFFICIENTS: ITacticalCoefficients = {
    pick: {
        base: 1.0,
        random: 0.6,
        randomFactor: 0.1,
        notUsedFactor: 0.35,
    },

    ban: {
        base: 0.8,
        random: 0.6,
        randomFactor: 0.05,
    },

    utility: {
        base: 0.5,
        random: 0.3,
        randomFactor: 0.2,
        usedOneSideFactor: 2,
        usedBothSidesFactor: 3,
    },

    clampRange: [0, 1.5],
};

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

    async getSynergy(mode: 'match' | 'team' | 'setup' = 'setup') {
        type MatchTacticalUsageWithTeam = Prisma.MatchTacticalUsageGetPayload<{
            include: {
                teamMember: {
                    include: {
                        team: true;
                    };
                };
            };
        }>;
        const usages: MatchTacticalUsageWithTeam[] = await this.prisma.matchTacticalUsage.findMany({
            include: {
                teamMember: {
                    include: {
                        team: true, // matchTeamId
                    },
                },
            },
        });

        const groupKey = (u: MatchTacticalUsageWithTeam) => {
            switch (mode) {
                case 'match':
                    return `${u.teamMember.team.matchId}`;
                case 'team':
                    return `${u.teamMember.teamId}`;
                case 'setup':
                    return `${u.teamMember.team.matchId}:${u.teamMember.teamId}:${u.setupNumber}`;
            }
        };

        const groupToCharacters: Record<string, string[]> = {};

        for (const u of usages) {
            const key = groupKey(u);
            if (!groupToCharacters[key]) groupToCharacters[key] = [];
            groupToCharacters[key].push(u.characterKey);
        }

        // 建 Synergy Matrix
        const synergy: Record<string, Record<string, number>> = {};

        for (const characters of Object.values(groupToCharacters)) {
            const uniq = [...new Set(characters)]; // 避免重複角色
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

    async getArchetypes(k = 6) {
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

    async getArchetypeMap(k = 6) {
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
        console.log(`pca`, pca)
        const projected = pca.predict(matrix.to2DArray(), { nComponents: 2 }).to2DArray();
        console.log(`projected`, projected)
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
