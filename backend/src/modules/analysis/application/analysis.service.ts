// backend/src/modules/analysis/application/analysis.service.ts

import { createLogger } from '../../../utils/logger';
import { buildCooccurrenceGroups } from '../domain/buildCooccurrenceGroups';
import CharacterFeatureMatrixBuilder from '../domain/CharacterFeatureMatrixBuilder';
import { computeAnalysisOverview } from '../domain/computeAnalysisOverview';
import { computeCharacterAttributeDistributions } from '../domain/computeCharacterAttributeDistributions';
import { computeCharacterPickPriority } from '../domain/computeCharacterPickPriority';
import { computeCharacterUsage } from '../domain/computeCharacterUsage';
import { computePlayerStyle } from '../domain/computePlayerStyle';
import CooccurrenceMatrixBuilder from '../domain/CooccurrenceMatrixBuilder';
import CharacterCommunityScanEngine from '../infra/clustering/CharacterCommunityScanEngine';
import CharacterSimilarityGraphBuilder from '../infra/graph/CharacterSimilarityGraphBuilder';

import type { ICharacterRepository } from '../../character/domain/ICharacterRepository';
import type { IMatchReadModel } from '../../match/domain/IMatchReadModel';
import type { IMatchRepository } from '../../match/domain/IMatchRepository';
import type { ICharacterAttributeDistributions } from '@shared/contracts/analysis/character/ICharacterAttributeDistributions';
import type { ICharacterGraphLink } from '@shared/contracts/analysis/character/ICharacterGraphLink';
import type { CharacterCooccurrenceMatrix } from '@shared/contracts/analysis/CharacterCooccurrenceMatrix';
import type { IAnalysisOverview } from '@shared/contracts/analysis/IAnalysisOverview';
import type { IArchetypePoint } from '@shared/contracts/analysis/IArchetypePoint';
import type { ICharacterCluster } from '@shared/contracts/analysis/ICharacterCluster';
import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';
import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';
import type { IPlayerStyle } from '@shared/contracts/analysis/IPlayerStyle';
import type { CooccurrenceGrain } from '@shared/contracts/analysis/value-types';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

const logger = createLogger('analysis.service');

export default class AnalysisService {
    constructor(
        private matchReadModel: IMatchReadModel,
        private cooccurrenceMatrixBuilder: CooccurrenceMatrixBuilder,
        private characterSimilarityGraphBuilder: CharacterSimilarityGraphBuilder,
        private characterFeatureMatrixBuilder: CharacterFeatureMatrixBuilder,
        private characterCommunityScanEngine: CharacterCommunityScanEngine,
        private characterRepository: ICharacterRepository,
        private matchRepository: IMatchRepository,
    ) {}

    async fetchOverview(): Promise<IAnalysisOverview> {
        const [statistics, lineupSlotPlacements, teamMemberPlacements] = await Promise.all([
            this.matchReadModel.findMatchStatistics(),
            this.matchReadModel.findMatchLineupSlotPlacements(),
            this.matchReadModel.findMatchTeamMemberPlacements(),
        ]);

        return computeAnalysisOverview(statistics, lineupSlotPlacements, teamMemberPlacements);
    }

    async fetchCharacterUsageSummary(timeWindow?: ITimeWindow): Promise<ICharacterUsage[]> {
        const [matches, matcheMoves, lineupSlotPlacements] = await Promise.all([
            this.matchRepository.findMatchTimestamps(timeWindow),
            this.matchRepository.findMatchMoves(timeWindow),
            this.matchReadModel.findMatchLineupSlotPlacements(timeWindow),
        ]);

        return computeCharacterUsage(matches, matcheMoves, lineupSlotPlacements);
    }

    async fetchCharacterUsagePickPriority(): Promise<ICharacterPickPriority[]> {
        const matcheMoves = await this.matchRepository.findMatchMoves();
        return computeCharacterPickPriority(matcheMoves);
    }

    async fetchCharacterCooccurrenceMatrix(grain: CooccurrenceGrain = 'setup'): Promise<CharacterCooccurrenceMatrix> {
        const lineupSlotPlacements = await this.matchReadModel.findMatchLineupSlotPlacements();
        const groups = buildCooccurrenceGroups(lineupSlotPlacements, (lineupSlotPlacement) => lineupSlotPlacement.characterKey, grain);
        const matrix = this.cooccurrenceMatrixBuilder.build(groups);
        return matrix;
    }

    async fetchCharacterCluster(): Promise<ICharacterCluster> {
        const [characters, lineupSlotPlacements] = await Promise.all([this.characterRepository.findAll(), this.matchReadModel.findMatchLineupSlotPlacements()]);
        const characterMap = Object.fromEntries(characters.map((character) => [character.key, character]));

        const groups = buildCooccurrenceGroups(lineupSlotPlacements, (lineupSlotPlacement) => lineupSlotPlacement.characterKey, 'setup');
        const matrix = this.cooccurrenceMatrixBuilder.build(groups);

        const pickCounts: Record<string, number> = {};
        for (const lineupSlotPlacement of lineupSlotPlacements) {
            const characterKey = lineupSlotPlacement.characterKey;
            pickCounts[characterKey] = (pickCounts[characterKey] || 0) + 1;
        }

        const graph = await this.characterSimilarityGraphBuilder.build(matrix, characterMap, pickCounts);

        const featureMatrix = this.characterFeatureMatrixBuilder.build(characters);
        const { archetypes, projected, clusterMedoids, bridgeScores } = await this.characterCommunityScanEngine.computeCluster(
            graph,
            matrix,
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

    async fetchPlayerStyle(playerIdentity: PlayerIdentity): Promise<IPlayerStyle | undefined> {
        const [playerSlots, globalSlots] = await Promise.all([
            this.matchReadModel.findMatchLineupSlotsWithCharacter(playerIdentity),
            this.matchReadModel.findMatchLineupSlotsWithCharacter(),
        ]);

        return computePlayerStyle(playerSlots, globalSlots);
    }

    async fetchCharacterAttributeDistributions(playerIdentity?: PlayerIdentity): Promise<ICharacterAttributeDistributions> {
        const slots = await this.matchReadModel.findMatchLineupSlotsWithCharacter(playerIdentity);
        return computeCharacterAttributeDistributions(slots);
    }
}
