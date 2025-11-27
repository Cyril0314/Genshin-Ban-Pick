// backend/src/modules/analysis/application/analysis.service.ts

import { Prisma, PrismaClient } from '@prisma/client';

import { SynergyNormalizationService } from './synergy/SynergyNormalizationService';
import { SynergyService } from './synergy/SynergyService';
import { ProjectionService } from './projection/ProjectionService';
import { ClusteringService } from './clustering/ClusteringService';
import { computeTacticalUsage } from './tactical/computeTacticalUsages';
import { SynergyMode } from './synergy/types/SynergyMode';
import ICharacterRepository from '../../character/domain/ICharacterRepository';

export default class AnalysisService {
    constructor(private prisma: PrismaClient, private synergyNormalizationService: SynergyNormalizationService, private synergyService: SynergyService, private clusteringService: ClusteringService, private projectionService: ProjectionService, private characterRepository: ICharacterRepository) {

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
        const characters = await this.characterRepository.findAll();
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
