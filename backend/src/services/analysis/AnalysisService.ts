// backend/src/services/analysis/AnalysisService.ts

import { PrismaClient } from '@prisma/client/extension';
import { createLogger } from '../../utils/logger.ts';
import { SynergyMode } from './synergy/types/SynergyMode.ts';
import { computeTacticalUsage } from './tactical/computeTacticalUsages.ts';
import { SynergyService } from './synergy/SynergyService.ts';
import { ClusteringService } from './clustering/ClusteringService.ts';
import { SynergyNormalizationService } from './synergy/SynergyNormalizationService.ts';
import { ProjectionService } from './projection/ProjectionService.ts';
import CharacterService from '../CharacterService.ts';

const logger = createLogger('ANALYSIS SERVICE');

export default class AnalysisService {
    synergyNormalizationService;
    synergyService;
    clusteringService;
    projectionService;

    constructor(
        private prisma: PrismaClient,
        private characterService: CharacterService,
    ) {
        this.synergyNormalizationService = new SynergyNormalizationService();
        this.synergyService = new SynergyService(this.prisma);
        this.projectionService = new ProjectionService();
        this.clusteringService = new ClusteringService(this.projectionService, this.synergyNormalizationService);
    }

    async getTacticalUsages() {
        return computeTacticalUsage(this.prisma);
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
        const raw = await this.synergyService.getRawTacticalUsages();
        const groups = this.synergyService.buildCooccurrenceGroups(raw, mode);
        const synergy = this.synergyService.buildSynergyMatrix(groups);
        return synergy;
    }

    async getCharacterClusters() {
        const characters = await this.characterService.getCharacters();
        const characterMap = Object.fromEntries(characters.map((character) => [character.key, character]));
        const synergy = await this.getSynergy();

        const { archetypes, projected, clusterMedoids, bridgeScores } = await this.clusteringService.computeClusters(synergy, characterMap);

        const archetypePoints = archetypes.map((archetype, i) => ({
                characterKey: archetype.characterKey,
                clusterId: archetype.clusterId,
                x: projected[i][0],
                y: projected[i][1],
            }))
        return {
            archetypePoints,
            bridgeScores,
            clusterMedoids,
        };
    }
}
