// backend/src/modules/analysis/application/analysis.service.ts

import CharacterSynergyCalculator from '../domain/CharacterSynergyCalculator';
import CharacterCommunityScanEngine from '../infra/clustering/CharacterCommunityScanEngine';
import CharacterSynergyGraphBuilder from '../infra/graph/CharacterSynergyGraphBuilder';
import CharacterFeatureMatrixBuilder from '../domain/CharacterFeatureMatrixBuilder';
import { computeCharacterUsage } from '../domain/computeCharacterUsage';
import { computeCharacterPickPriority } from '../domain/computeCharacterPickPriority';
import { computePlayerStyleProfile } from '../domain/computePlayerStyleProfile';
import { computePlayerRecord } from '../domain/computePlayerRecord';
import { playerDisplayName, type PlayerNameLookup } from '../domain/playerDisplayName';
import { computeCharacterAttributeDistributions } from '../domain/computeCharacterAttributeDistributions';
import { createLogger } from '../../../utils/logger';

import type { ICharacterRepository } from '../../character/domain/ICharacterRepository';
import type { IMatchRepository } from '../../match/domain/IMatchRepository';
import type { IMemberRepository } from '../../auth/domain/IMemberRepository';
import type { IGuestRepository } from '../../auth/domain/IGuestRepository';
import type { IAnalysisRepository } from '../domain/IAnalysisRepository';
import type { ICharacterCluster } from '@shared/contracts/analysis/ICharacterCluster';
import type { IArchetypePoint } from '@shared/contracts/analysis/IArchetypePoint';
import type { CharacterSynergyMatrix } from '@shared/contracts/analysis/CharacterSynergyMatrix';
import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';
import type { IPlayerStyleProfile } from '@shared/contracts/analysis/IPlayerStyleProfile';
import type { IPlayerRecord } from '@shared/contracts/analysis/IPlayerRecord';
import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { ICharacterGraphLink } from '@shared/contracts/analysis/character/ICharacterGraphLink';
import type { KeyIndexedMatrix } from '@shared/contracts/analysis/KeyIndexedMatrix';
import type { PlayerIdentity } from '@shared/contracts/player/PlayerIdentity';
import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';
import type { ICharacterAttributeDistributions } from '@shared/contracts/analysis/character/ICharacterAttributeDistributions';
import type { IMatchTacticalUsageWithCharacter } from '../types/IMatchTacticalUsageWithCharacter';
import type { IAnalysisOverview } from '@shared/contracts/analysis/IAnalysisOverview';
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';
import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';


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
        private memberRepository: IMemberRepository,
        private guestRepository: IGuestRepository,
    ) {}

    async fetchOverview(): Promise<IAnalysisOverview> {
        const overview = await this.analysisRepository.findMatchStatisticsOverview()
        return {
            volume: {
                matchCount: overview.totalMatches,
                matchCharacterCombinationCount: overview.uniqueCharacterCombinations,
                matchTeamMemberCombinationCount: overview.uniqueTeamMemberCombinations,
                players: {
                    total: overview.uniquePlayers.member + overview.uniquePlayers.guest + overview.uniquePlayers.onlyName,
                    member: overview.uniquePlayers.member,
                    guest: overview.uniquePlayers.guest,
                    onlyName: overview.uniquePlayers.onlyName,
                },
                characters: overview.uniqueCharacters,
                moves: overview.moves
            },
            activity: {
                earliestMatchAt: overview.dateRange.from.toISOString(),
                latestMatchAt: overview.dateRange.to.toISOString(),
                versionSpan: overview.versionSpan
            }
        }
    }

    async fetchMatchTimeline(timeWindow?: IAnalysisTimeWindow): Promise<IMatchTimeMinimal[]>  {
        const matches = await this.analysisRepository.findAllMatchMinimalTimestamps(timeWindow);
        return matches
    }

    async fetchCharacterUsageSummary(timeWindow?: IAnalysisTimeWindow): Promise<ICharacterUsage[]> {
        const matches = await this.analysisRepository.findAllMatchMinimalTimestamps(timeWindow);
        const matcheMoves = await this.analysisRepository.findAllMatchMoveCoreForWeightCalc(timeWindow);
        const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageForAnalysis(timeWindow);
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

    async fetchPlayerStyleProfile(identityKey: PlayerIdentity): Promise<IPlayerStyleProfile | undefined> {
        const memberUsages = await this.analysisRepository.findMatchTacticalUsageWithCharacterByIdentityKey(identityKey);
        const allUsages = await this.analysisRepository.findAllMatchTacticalUsageWithCharacter();
        return computePlayerStyleProfile(memberUsages, allUsages);
    }

    async fetchPlayerRecord(identityKey: PlayerIdentity): Promise<IPlayerRecord> {
        const [playerRows, usages, nameLookup] = await Promise.all([
            this.analysisRepository.findMatchTacticalUsageWithCharacterByIdentityKey(identityKey),
            this.analysisRepository.findAllMatchTacticalUsageForAnalysis(),
            this.lookupIdentityNicknames(identityKey),
        ]);
        const groups = this.characterSynergyCalculator.buildCooccurrenceGroups(usages, 'setup');
        const synergyMatrix = this.characterSynergyCalculator.buildSynergyMatrix(groups);
        const displayName = playerDisplayName(identityKey, nameLookup);

        return computePlayerRecord(playerRows, synergyMatrix, identityKey, displayName);
    }

    private async lookupIdentityNicknames(identity: PlayerIdentity): Promise<PlayerNameLookup> {
        if (identity.type === 'Member') {
            const member = await this.memberRepository.findById(identity.id);
            return { memberNickname: member?.nickname };
        }
        if (identity.type === 'Guest') {
            const guest = await this.guestRepository.findById(identity.id);
            return { guestNickname: guest?.nickname };
        }
        return {};
    }

    async fetchCharacterAttributeDistributions(scope: { type: 'Player'; identityKey: PlayerIdentity } | { type: 'Global' }): Promise<ICharacterAttributeDistributions> {
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
}
