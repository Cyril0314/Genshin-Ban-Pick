// backend/src/modules/analyses/application/analysis.service.ts

import { Prisma, PrismaClient } from '@prisma/client';

import { DataNotFoundError } from '../../../errors/AppError.ts';
import { SynergyNormalizationService } from './synergy/SynergyNormalizationService.ts';
import { SynergyService } from './synergy/SynergyService.ts';
import { ProjectionService } from './projection/ProjectionService.ts';
import { ClusteringService } from './clustering/ClusteringService.ts';
import { computeTacticalUsage } from './tactical/computeTacticalUsages.ts';
import { SynergyMode } from './synergy/types/SynergyMode.ts';
import { ICharacterProvider } from '../domain/ICharacterProvider.ts';

export default class AnalysisService {
    synergyNormalizationService;
    synergyService;
    clusteringService;
    projectionService;

    constructor(
        private prisma: PrismaClient,
        private characterProvider: ICharacterProvider,
    ) {
        this.synergyNormalizationService = new SynergyNormalizationService();
        this.synergyService = new SynergyService(this.prisma);
        this.projectionService = new ProjectionService();
        this.clusteringService = new ClusteringService(this.projectionService, this.synergyNormalizationService);
    }

    async fetchTacticalUsages() {
        return computeTacticalUsage(this.prisma);
    }

    async fetchPreference() {
        type MatchTacticalUsage = Prisma.MatchTacticalUsageGetPayload<{
            include: {
                teamMember: {
                    include: {
                        member: true;
                        guest: true;
                    };
                };
            };
        }>;

        const usages: MatchTacticalUsage[] = await this.prisma.matchTacticalUsage.findMany({
            include: {
                teamMember: {
                    include: {
                        member: true,
                        guest: true,
                    },
                },
            },
        });

        // 計算偏好
        const preferenceMap: Record<string, Record<string, number>> = {};

        for (const u of usages) {
            const playerName = u.teamMember.member?.nickname ?? u.teamMember.guest?.nickname ?? u.teamMember.name;
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
        // logger.info('playerPreferences =\n' + JSON.stringify(playerPreferences, null, 2));

        return playerPreferences;
    }

    async fetchSynergy(mode: SynergyMode = 'setup') {
        const raw = await this.synergyService.getRawTacticalUsages();
        const groups = this.synergyService.buildCooccurrenceGroups(raw, mode);
        const synergy = this.synergyService.buildSynergyMatrix(groups);
        return synergy;
    }

    async fetchCharacterClusters() {
        const characters = await this.characterProvider.fetchCharacters();
        const characterMap = Object.fromEntries(characters.map((character) => [character.key, character]));
        const synergy = await this.fetchSynergy();

        const { archetypes, projected, clusterMedoids, bridgeScores } = await this.clusteringService.computeClusters(synergy, characterMap);

        const archetypePoints = archetypes.map((archetype, i) => ({
            characterKey: archetype.characterKey,
            clusterId: archetype.clusterId,
            x: projected[i][0],
            y: projected[i][1],
        }));
        return {
            archetypePoints,
            bridgeScores,
            clusterMedoids,
        };
    }
}
