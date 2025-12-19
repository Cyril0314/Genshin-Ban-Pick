// backend/src/modules/analysis/application/analysis.service.ts

import CharacterSynergyCalculator from '../infra/synergy/CharacterSynergyCalculator';
import CharacterCommunityScanEngine from '../infra/clustering/CharacterCommunityScanEngine';
import CharacterSynergyGraphBuilder from '../infra/graph/CharacterSynergyGraphBuilder';
import CharacterFeatureMatrixBuilder from '../infra/character/CharacterFeatureMatrixBuilder';
import { computeCharacterUsage } from '../infra/tactical/computeCharacterUsage';
import { computeCharacterPickPriority } from '../infra/tactical/computeCharacterPickPriority';
import { computePlayerStyleProfile } from '../infra/statistics/computePlayerStyleProfile';
import { computeCharacterAttributeDistributions } from '../infra/character/computeCharacterAttributeDistributions';
import { createLogger } from '../../../utils/logger';

import type { ICharacterRepository } from '../../character/domain/ICharacterRepository';
import type { IMatchRepository } from '../../match/domain/IMatchRepository';
import type { IAnalysisRepository } from '../domain/IAnalysisRepository';
import type { ICharacterCluster } from '@shared/contracts/analysis/ICharacterCluster';
import type { IArchetypePoint } from '@shared/contracts/analysis/IArchetypePoint';
import type { CharacterSynergyMatrix } from '@shared/contracts/analysis/CharacterSynergyMatrix';
import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';
import type { IPlayerStyleProfile } from '@shared/contracts/analysis/IPlayerStyleProfile';
import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { ICharacterGraphLink } from '@shared/contracts/analysis/character/ICharacterGraphLink';
import type { KeyIndexedMatrix } from '@shared/contracts/analysis/KeyIndexedMatrix';
import type { MatchTeamMemberUniqueIdentityKey } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';
import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';
import type { ICharacterAttributeDistributions } from '@shared/contracts/analysis/character/ICharacterAttributeDistributions';
import type { IMatchTacticalUsageWithCharacter } from '../types/IMatchTacticalUsageWithCharacter';
import type { IAnalysisOverview } from '@shared/contracts/analysis/IAnalysisOverview';


const logger = createLogger('ANALYSIS');

export default class AnalysisService {
    constructor(
        private analysisRepository: IAnalysisRepository,
        private characterSynergyCalculator: CharacterSynergyCalculator,
        private characterSynergyGraphBuilder: CharacterSynergyGraphBuilder,
        private characterFeatureMatrixBuilder: CharacterFeatureMatrixBuilder,
        private characterCommunityScanEngine: CharacterCommunityScanEngine,
        private characterRepository: ICharacterRepository,
        private matchRepository: IMatchRepository,
    ) {}

    async fetchOverview(): Promise<IAnalysisOverview> {
        const overview = await this.analysisRepository.findMatchStatisticsOverview()
        return {
            volume: {
                matchCount: overview.totalMatches,
                playerCount: overview.uniquePlayers,
                characterCount: overview.uniqueCharacters,
            },
            activity: {
                earliestMatchAt: overview.dateRange.from.toISOString(),
                latestMatchAt: overview.dateRange.to.toISOString()
            }
        }
    }

    async fetchCharacterUsageSummary(): Promise<ICharacterUsage[]> {
        const matches = await this.analysisRepository.findAllMatchMinimalTimestamps();
        const matcheMoves = await this.analysisRepository.findAllMatchMoveCoreForWeightCalc();
        const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageForAnalysis();
        return computeCharacterUsage(matches, matcheMoves, matchTacticalUsages);
    }

    async fetchCharacterUsagePickPriority(): Promise<ICharacterPickPriority[]> {
        const matcheMoves = await this.analysisRepository.findAllMatchMoveCoreForWeightCalc();
        return computeCharacterPickPriority(matcheMoves);
    }

    async fetchCharacterSynergyMatrix(mode: SynergyMode = 'setup'): Promise<CharacterSynergyMatrix> {
        const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageForAnalysis();
        const groups = this.characterSynergyCalculator.buildCooccurrenceGroups(matchTacticalUsages, mode);
        const synergy = this.characterSynergyCalculator.buildSynergyMatrix(groups);
        return synergy;
    }

    async fetchCharacterSynergyGraph() {
        // const characters = await this.characterRepository.findAll();
        // const characterMap = Object.fromEntries(characters.map((character) => [character.key, character]));

        // // Re-implement logic to get pickCounts + synergy matrix together to ensure consistency
        // const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageForAnalysis();
        // const groups = this.characterSynergyCalculator.buildCooccurrenceGroups(matchTacticalUsages, 'setup');
        // const synergyMatrix = this.characterSynergyCalculator.buildSynergyMatrix(groups);

        // // Calculate pick counts from groups
        // const pickCounts: Record<string, number> = {};
        // for (const members of Object.values(groups)) {
        //     const unique = new Set(members);
        //     for (const char of unique) {
        //         pickCounts[char] = (pickCounts[char] || 0) + 1;
        //     }
        // }

        // const graph = await this.characterSynergyGraphBuilder.build(synergyMatrix, characterMap, pickCounts);
        // const nodes: string[] = graph.nodes();

        // const links: ICharacterGraphLink[] = graph.edges().map((edgeKey) => {
        //     const attrs = graph.getEdgeAttributes(edgeKey);
        //     const source = graph.source(edgeKey);
        //     const target = graph.target(edgeKey);
        //     return {
        //         source,
        //         target,
        //         weight: attrs.weight,
        //     };
        // });
        // console.log(nodes, links);
        // return { nodes, links };
    }

    async fetchCharacterCluster(): Promise<ICharacterCluster> {
        const characters = await this.characterRepository.findAll();
        const characterMap = Object.fromEntries(characters.map((character) => [character.key, character]));

        // Consistent calculation
        const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageForAnalysis();
        const groups = this.characterSynergyCalculator.buildCooccurrenceGroups(matchTacticalUsages, 'setup');
        const synergyMatrix = this.characterSynergyCalculator.buildSynergyMatrix(groups);

        const pickCounts: Record<string, number> = {};
        for (const matchTacticalUsage of matchTacticalUsages) {
            const characterKey = matchTacticalUsage.characterKey
            pickCounts[characterKey] = (pickCounts[characterKey] || 0) + 1;
        }

        const graph = await this.characterSynergyGraphBuilder.build(synergyMatrix, characterMap, pickCounts);

        const featureMatrix = this.characterFeatureMatrixBuilder.build(characters);
        const { archetypes, projected, clusterMedoids, bridgeScores } = await this.characterCommunityScanEngine.computeCluster(
            graph,
            synergyMatrix,
            featureMatrix,
        );

        const archetypePoints: IArchetypePoint[] = archetypes.map((archetype, i: number) => ({
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

    async fetchPlayerCharacterUsage(): Promise<KeyIndexedMatrix<string, string>> {
        const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageIdentities();

        const matrix: KeyIndexedMatrix<string, string> = {};

        for (const u of matchTacticalUsages) {
            const playerName = u.memberNickname ?? u.guestNickname ?? u.teamMemberName;
            const charKey = u.characterKey;

            if (!matrix[playerName]) matrix[playerName] = {};
            if (!matrix[playerName][charKey]) matrix[playerName][charKey] = 0;

            matrix[playerName][charKey]++;
        }

        return matrix;
    }

    async fetchPlayerStyleProfile(identityKey: MatchTeamMemberUniqueIdentityKey): Promise<IPlayerStyleProfile> {
        const memberUsages = await this.analysisRepository.findMatchTacticalUsageWithCharacterByIdentityKey(identityKey);
        const allUsages = await this.analysisRepository.findAllMatchTacticalUsageWithCharacter();
        return computePlayerStyleProfile(memberUsages, allUsages);
    }

    async fetchCharacterAttributeDistributions(scope: { type: 'Player'; identityKey: MatchTeamMemberUniqueIdentityKey } | { type: 'Global' }): Promise<ICharacterAttributeDistributions> {
        let usages: IMatchTacticalUsageWithCharacter[]
        switch (scope.type) {
            case 'Global':
                usages = await this.analysisRepository.findAllMatchTacticalUsageWithCharacter();
                break
            case 'Player':
                usages = await this.analysisRepository.findMatchTacticalUsageWithCharacterByIdentityKey(scope.identityKey);
                break
        }
        return computeCharacterAttributeDistributions(usages)
    }

    // async fetchCharacterAttributeDistributions(): Promise<IGlobalStatistic> {
    //     const matches = await this.matchRepository.findAllMatches()
    //     console.log('macthes', JSON.stringify(matches, null, 2))
    //     return {}
    // }
}
