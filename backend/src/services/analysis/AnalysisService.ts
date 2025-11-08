// backend/src/services/AnalysisService.ts

import { PrismaClient } from '@prisma/client/extension';
import { Matrix } from 'ml-matrix';
import kmeans from 'ml-kmeans';
import PCA from 'ml-pca';
import { createLogger } from '../../utils/logger.ts';
import { log } from 'console';

const logger = createLogger('ANALYSIS SERVICE');

export default class AnalysisService {
    constructor(private prisma: PrismaClient) {}

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
