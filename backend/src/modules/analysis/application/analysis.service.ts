// backend/src/modules/analysis/application/analysis.service.ts

import CooccurrenceMatrixBuilder from '../domain/CooccurrenceMatrixBuilder';
import CooccurrenceCalculator from '../domain/CooccurrenceCalculator';
import CharacterCommunityScanEngine from '../infra/clustering/CharacterCommunityScanEngine';
import CharacterSimilarityGraphBuilder from '../infra/graph/CharacterSimilarityGraphBuilder';
import CharacterFeatureMatrixBuilder from '../domain/CharacterFeatureMatrixBuilder';
import { computeCharacterUsage } from '../domain/computeCharacterUsage';
import { computeCharacterPickPriority } from '../domain/computeCharacterPickPriority';
import { computePlayerStyle } from '../domain/computePlayerStyle';
import { computeCharacterAttributeDistributions } from '../domain/computeCharacterAttributeDistributions';
import { computeAnalysisOverview } from '../domain/computeAnalysisOverview';
import { createLogger } from '../../../utils/logger';

import type { ICharacterRepository } from '../../character/domain/ICharacterRepository';
import type { IMatchRepository } from '../../match/domain/IMatchRepository';
import type { IMatchReadModel } from '../../match/domain/IMatchReadModel';
import type { ICharacterCluster } from '@shared/contracts/analysis/ICharacterCluster';
import type { IArchetypePoint } from '@shared/contracts/analysis/IArchetypePoint';
import type { CharacterCooccurrenceMatrix } from '@shared/contracts/analysis/CharacterCooccurrenceMatrix';
import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';
import type { IPlayerStyle } from '@shared/contracts/analysis/IPlayerStyle';
import type { CooccurrenceGrain } from '@shared/contracts/analysis/value-types';
import type { ICharacterGraphLink } from '@shared/contracts/analysis/character/ICharacterGraphLink';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';
import type { ICharacterAttributeDistributions } from '@shared/contracts/analysis/character/ICharacterAttributeDistributions';
import type { IAnalysisOverview } from '@shared/contracts/analysis/IAnalysisOverview';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';

const logger = createLogger('analysis.service');

export default class AnalysisService {
    constructor(
        private matchReadModel: IMatchReadModel,
        private cooccurrenceCalculator: CooccurrenceCalculator,
        private cooccurrenceMatrixBuilder: CooccurrenceMatrixBuilder,
        private characterSimilarityGraphBuilder: CharacterSimilarityGraphBuilder,
        private characterFeatureMatrixBuilder: CharacterFeatureMatrixBuilder,
        private characterCommunityScanEngine: CharacterCommunityScanEngine,
        private characterRepository: ICharacterRepository,
        private matchRepository: IMatchRepository,
    ) {}

    async fetchOverview(): Promise<IAnalysisOverview> {
        const [raw, cooccurrenceRows] = await Promise.all([
            this.matchReadModel.findMatchStatisticsRaw(),
            this.matchReadModel.findMatchLineupSlotPlacements(),
        ]);

        return computeAnalysisOverview(raw, cooccurrenceRows);
    }

    async fetchCharacterUsageSummary(timeWindow?: ITimeWindow): Promise<ICharacterUsage[]> {
        const [matches, matcheMoves, cooccurrenceRows] = await Promise.all([
            this.matchRepository.findMatchTimestamps(timeWindow),
            this.matchRepository.findMatchMoves(timeWindow),
            this.matchReadModel.findMatchLineupSlotPlacements(timeWindow),
        ]);

        return computeCharacterUsage(matches, matcheMoves, cooccurrenceRows);
    }

    async fetchCharacterUsagePickPriority(): Promise<ICharacterPickPriority[]> {
        const matcheMoves = await this.matchRepository.findMatchMoves();
        return computeCharacterPickPriority(matcheMoves);
    }

    async fetchCharacterCooccurrenceMatrix(grain: CooccurrenceGrain = 'setup'): Promise<CharacterCooccurrenceMatrix> {
        const rows = await this.matchReadModel.findMatchLineupSlotPlacements();
        const groups = this.cooccurrenceCalculator.buildCooccurrenceGroups(rows, (row) => row.characterKey, grain);
        const matrix = this.cooccurrenceMatrixBuilder.build(groups);
        return matrix;
    }

    async fetchCharacterCluster(): Promise<ICharacterCluster> {
        const [characters, rows] = await Promise.all([this.characterRepository.findAll(), this.matchReadModel.findMatchLineupSlotPlacements()]);
        const characterMap = Object.fromEntries(characters.map((character) => [character.key, character]));

        const groups = this.cooccurrenceCalculator.buildCooccurrenceGroups(rows, (row) => row.characterKey, 'setup');
        const matrix = this.cooccurrenceMatrixBuilder.build(groups);

        const pickCounts: Record<string, number> = {};
        for (const row of rows) {
            const characterKey = row.characterKey;
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
