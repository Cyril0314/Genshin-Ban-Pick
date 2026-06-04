// backend/src/modules/analysis/application/analysis.service.ts

import CharacterSynergyCalculator from '../domain/CharacterSynergyCalculator';
import CharacterCommunityScanEngine from '../infra/clustering/CharacterCommunityScanEngine';
import CharacterSynergyGraphBuilder from '../infra/graph/CharacterSynergyGraphBuilder';
import CharacterFeatureMatrixBuilder from '../domain/CharacterFeatureMatrixBuilder';
import { computeCharacterUsage } from '../domain/computeCharacterUsage';
import { computeCharacterPickPriority } from '../domain/computeCharacterPickPriority';
import { computePlayerStyleProfile } from '../domain/computePlayerStyleProfile';
import { computePlayerRecord } from '../domain/computePlayerRecord';
import { computeCharacterAttributeDistributions } from '../domain/computeCharacterAttributeDistributions';
import { computeAnalysisOverview } from '../domain/computeAnalysisOverview';
import { countCharacterKeys } from '../domain/countCharacterKeys';
import { createLogger } from '../../../utils/logger';
import { stringifyPlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

import type { ICharacterRepository } from '../../character/domain/ICharacterRepository';
import type { IMatchRepository } from '../../match/domain/IMatchRepository';
import type UserService from '../../user/application/user.service';
import type { IAnalysisRepository } from '../domain/IAnalysisRepository';
import type { ICharacterCluster } from '@shared/contracts/analysis/ICharacterCluster';
import type { IArchetypePoint } from '@shared/contracts/analysis/IArchetypePoint';
import type { CharacterSynergyMatrix } from '@shared/contracts/analysis/CharacterSynergyMatrix';
import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';
import type { IPlayerStyleProfile } from '@shared/contracts/analysis/IPlayerStyleProfile';
import type { IPlayerRecord } from '@shared/contracts/analysis/IPlayerRecord';
import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { ICharacterGraphLink } from '@shared/contracts/analysis/character/ICharacterGraphLink';
import type { IPlayerCharacterUsage } from '@shared/contracts/analysis/IPlayerCharacterUsage';
import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';
import type { ICharacterAttributeDistributions } from '@shared/contracts/analysis/character/ICharacterAttributeDistributions';
import type { IAnalysisOverview } from '@shared/contracts/analysis/IAnalysisOverview';
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';
import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';

const logger = createLogger('analysis.service');

export default class AnalysisService {
    constructor(
        private analysisRepository: IAnalysisRepository,
        private characterSynergyCalculator: CharacterSynergyCalculator,
        private characterSynergyGraphBuilder: CharacterSynergyGraphBuilder,
        private characterFeatureMatrixBuilder: CharacterFeatureMatrixBuilder,
        private characterCommunityScanEngine: CharacterCommunityScanEngine,
        private characterRepository: ICharacterRepository,
        private matchRepository: IMatchRepository,
        private userService: UserService,
    ) {}

    async fetchOverview(): Promise<IAnalysisOverview> {
        const [raw, cooccurrenceRows] = await Promise.all([
            this.analysisRepository.findMatchStatisticsRaw(),
            this.analysisRepository.findMatchLineupSlotsForCooccurrence(),
        ]);

        return computeAnalysisOverview(raw, cooccurrenceRows);
    }

    async fetchMatchTimeline(timeWindow?: IAnalysisTimeWindow): Promise<IMatchTimeMinimal[]> {
        const matches = await this.analysisRepository.findMatchMinimalTimestamps(timeWindow);
        return matches;
    }

    async fetchCharacterUsageSummary(timeWindow?: IAnalysisTimeWindow): Promise<ICharacterUsage[]> {
        const [matches, matcheMoves, cooccurrenceRows] = await Promise.all([
            this.analysisRepository.findMatchMinimalTimestamps(timeWindow),
            this.analysisRepository.findMatchMoveCoreForWeightCalc(timeWindow),
            this.analysisRepository.findMatchLineupSlotsForCooccurrence(timeWindow),
        ]);

        return computeCharacterUsage(matches, matcheMoves, cooccurrenceRows);
    }

    async fetchCharacterUsagePickPriority(): Promise<ICharacterPickPriority[]> {
        const matcheMoves = await this.analysisRepository.findMatchMoveCoreForWeightCalc();
        return computeCharacterPickPriority(matcheMoves);
    }

    async fetchCharacterSynergyMatrix(mode: SynergyMode = 'setup'): Promise<CharacterSynergyMatrix> {
        const cooccurrenceRows = await this.analysisRepository.findMatchLineupSlotsForCooccurrence();
        const groups = this.characterSynergyCalculator.buildCooccurrenceGroups(cooccurrenceRows, mode);
        const synergy = this.characterSynergyCalculator.buildSynergyMatrix(groups);
        return synergy;
    }

    async fetchCharacterCluster(): Promise<ICharacterCluster> {
        const [characters, cooccurrenceRows] = await Promise.all([
            this.characterRepository.findAll(),
            this.analysisRepository.findMatchLineupSlotsForCooccurrence(),
        ]);
        const characterMap = Object.fromEntries(characters.map((character) => [character.key, character]));

        const groups = this.characterSynergyCalculator.buildCooccurrenceGroups(cooccurrenceRows, 'setup');
        const synergyMatrix = this.characterSynergyCalculator.buildSynergyMatrix(groups);

        const pickCounts: Record<string, number> = {};
        for (const cooccurrenceRow of cooccurrenceRows) {
            const characterKey = cooccurrenceRow.characterKey;
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

    async fetchPlayerCharacterUsage(): Promise<IPlayerCharacterUsage[]> {
        const slots = await this.analysisRepository.findMatchLineupSlotsWithTeamMember();

        const slotsMap = new Map<string, { teamMember: TeamMember; slots: { characterKey: string }[] }>();
        for (const slot of slots) {
            const key = stringifyPlayerIdentity(slot.teamMember);
            let bucket = slotsMap.get(key);
            if (!bucket) {
                bucket = { teamMember: slot.teamMember, slots: [] };
                slotsMap.set(key, bucket);
            }
            bucket.slots.push(slot);
        }

        return Array.from(slotsMap.values()).map(({ teamMember, slots }) => ({
            teamMember,
            characterCounts: countCharacterKeys(slots),
        }));
    }

    async fetchPlayerStyleProfile(playerIdentity: PlayerIdentity): Promise<IPlayerStyleProfile | undefined> {
        const [playerSlots, globalSlots] = await Promise.all([
            this.analysisRepository.findMatchLineupSlotsWithCharacter(playerIdentity),
            this.analysisRepository.findMatchLineupSlotsWithCharacter(),
        ]);

        return computePlayerStyleProfile(playerSlots, globalSlots);
    }

    async fetchPlayerRecord(playerIdentity: PlayerIdentity): Promise<IPlayerRecord> {
        const [slots, cooccurrenceRows] = await Promise.all([
            this.analysisRepository.findMatchLineupSlotsWithTeamMember(playerIdentity),
            this.analysisRepository.findMatchLineupSlotsForCooccurrence(),
        ]);
        const teamMember = slots[0]?.teamMember ?? (await this.resolveTeamMember(playerIdentity));
        const groups = this.characterSynergyCalculator.buildCooccurrenceGroups(cooccurrenceRows, 'setup');
        const synergyMatrix = this.characterSynergyCalculator.buildSynergyMatrix(groups);

        return computePlayerRecord(slots, synergyMatrix, teamMember);
    }

    async fetchCharacterAttributeDistributions(playerIdentity?: PlayerIdentity): Promise<ICharacterAttributeDistributions> {
        const slots = await this.analysisRepository.findMatchLineupSlotsWithCharacter(playerIdentity);
        return computeCharacterAttributeDistributions(slots);
    }

    private async resolveTeamMember(playerIdentity: PlayerIdentity): Promise<TeamMember> {
        if (playerIdentity.type === 'Name') return { type: 'Name', name: playerIdentity.name };
        const user = await this.userService.fetchUser({ type: playerIdentity.type, id: playerIdentity.id });
        return { type: playerIdentity.type, id: playerIdentity.id, nickname: user.nickname };
    }
}
