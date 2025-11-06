// backend/src/services/AnalysisService.ts

import { PrismaClient } from '@prisma/client/extension';
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

        return playerPreferences
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

        return synergy
    }

    async getArchetypes() {

    }
}

// function normalizeMatrix(matrix: number[][]) {
//   const X = tf.tensor2d(matrix);
//   const mean = X.mean(0);
//   const std = X.sub(mean).square().mean(0).sqrt();
//   const normalized = X.sub(mean).div(std);
//   return normalized;
// }