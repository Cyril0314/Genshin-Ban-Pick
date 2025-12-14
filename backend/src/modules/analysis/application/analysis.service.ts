// backend/src/modules/analysis/application/analysis.service.ts

import CharacterSynergyCalculator from '../infra/synergy/CharacterSynergyCalculator';
import CharacterCommunityScanEngine from '../infra/clustering/CharacterCommunityScanEngine';
import CharacterSynergyGraphBuilder from '../infra/graph/CharacterSynergyGraphBuilder';
import CharacterFeatureMatrixBuilder from '../infra/character/CharacterFeatureMatrixBuilder';
import { computeCharacterTacticalUsage } from '../infra/tactical/computeCharacterTacticalUsage';
import { computePlayerStyleProfile } from '../infra/statistics/computePlayerStyleProfile';
import { createLogger } from '../../../utils/logger';

import type { ICharacterRepository } from '../../character/domain/ICharacterRepository';
import type { IAnalysisRepository } from '../domain/IAnalysisRepository';
import type { ICharacterClusters } from '@shared/contracts/analysis/ICharacterClusters';
import type { IArchetypePoint } from '@shared/contracts/analysis/IArchetypePoint';
import type { CharacterSynergyMatrix } from '@shared/contracts/analysis/CharacterSynergyMatrix';
import type { ICharacterTacticalUsage } from '@shared/contracts/analysis/ICharacterTacticalUsage';
import type { IPlayerStyleProfile } from '@shared/contracts/analysis/IPlayerStyleProfile';
import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { ICharacterGraphLink } from '@shared/contracts/analysis/character/ICharacterGraphLink';
import type { KeyIndexedMatrix } from '@shared/contracts/analysis/KeyIndexedMatrix';
import type { MatchTeamMemberUniqueIdentity } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

const logger = createLogger('ANALYSIS')

export default class AnalysisService {
    constructor(
        private analysisRepository: IAnalysisRepository,
        private characterSynergyCalculator: CharacterSynergyCalculator,
        private characterSynergyGraphBuilder: CharacterSynergyGraphBuilder,
        private characterFeatureMatrixBuilder: CharacterFeatureMatrixBuilder,
        private characterCommunityScanEngine: CharacterCommunityScanEngine,
        private characterRepository: ICharacterRepository,
    ) {}

    async fetchTacticalUsages(): Promise<ICharacterTacticalUsage[]> {
        const matches = await this.analysisRepository.findAllMatchMinimalTimestamps();
        const matcheMoves = await this.analysisRepository.findAllMatchMoveCoreForWeightCalc();
        const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageForAnalysis();
        return computeCharacterTacticalUsage(matches, matcheMoves, matchTacticalUsages);
    }

    async fetchCharacterSynergyMatrix(mode: SynergyMode = 'setup'): Promise<CharacterSynergyMatrix> {
        const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageForAnalysis();
        const groups = this.characterSynergyCalculator.buildCooccurrenceGroups(matchTacticalUsages, mode);
        const synergy = this.characterSynergyCalculator.buildSynergyMatrix(groups);
        return synergy;
    }

    async fetchCharacterSynergyGraph() {
        const characters = await this.characterRepository.findAll();
        const characterMap = Object.fromEntries(characters.map((character) => [character.key, character]));
        const synergyMatrix = await this.fetchCharacterSynergyMatrix();
        const graph = await this.characterSynergyGraphBuilder.build(synergyMatrix, characterMap)
        const nodes: string[] = graph.nodes()

        const links: ICharacterGraphLink[] = graph.edges().map((edgeKey) => {
            const attrs = graph.getEdgeAttributes(edgeKey);
            const source = graph.source(edgeKey);
            const target = graph.target(edgeKey);
            return {
                source,
                target,
                weight: attrs.weight,
            };
        });
        console.log(nodes, links)
        return { nodes, links };
    }

    async fetchCharacterClusters(): Promise<ICharacterClusters> {
        const characters = await this.characterRepository.findAll();
        const characterMap = Object.fromEntries(characters.map((character) => [character.key, character]));
        const synergyMatrix = await this.fetchCharacterSynergyMatrix();
        const graph = await this.characterSynergyGraphBuilder.build(synergyMatrix, characterMap)

        const featureMatrix = this.characterFeatureMatrixBuilder.build(characters)
        const { archetypes, projected, clusterMedoids, bridgeScores } = await this.characterCommunityScanEngine.computeClusters(
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

    async fetchPlayerPreference(): Promise<KeyIndexedMatrix<string, string>> {
        const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageIdentities();

        const matrix: KeyIndexedMatrix<string, string> = {};

        for (const u of matchTacticalUsages) {
            const playerName = u.memberNickname ?? u.guestNickname ?? u.teamMemberName;
            const charKey = u.characterKey;

            if (!matrix[playerName]) matrix[playerName] = {};
            if (!matrix[playerName][charKey]) matrix[playerName][charKey] = 0;

            matrix[playerName][charKey]++;
        }

        return matrix

        // 排序成曲線
        // const playerPreferences = Object.entries(preferenceMap).map(([player, table]) => {
        //     const sorted = Object.entries(table)
        //         .sort((a, b) => b[1] - a[1]) // 次數降序
        //         .map(([characterKey, count]) => ({ characterKey, count }));
        //     return { player, characters: sorted };
        // });

        // return playerPreferences;
    }

    async fetchPlayerStyleProfile(identity: MatchTeamMemberUniqueIdentity): Promise<IPlayerStyleProfile> {
        const memberUsages = await this.analysisRepository.findMatchTacticalUsageWithCharacterByIdentity(identity);
        const allUsages = await this.analysisRepository.findAllMatchTacticalUsageWithCharacter();
        // logger.debug("memberMatchMoves", memberUsages)
        return computePlayerStyleProfile(memberUsages, allUsages)
    }
}
