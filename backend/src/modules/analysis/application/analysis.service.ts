// backend/src/modules/analysis/application/analysis.service.ts

import CharacterSynergyCalculator from '../infra/synergy/CharacterSynergyCalculator';
import CharacterCommunityScanEngine from '../infra/clustering/CharacterCommunityScanEngine';
import { computeCharacterTacticalUsage } from '../infra/tactical/computeCharacterTacticalUsage';
import { computePlayerStyle } from '../infra/statistics/computePlayerStyle';

import type { ICharacterRepository } from '../../character/domain/ICharacterRepository';
import type { IAnalysisRepository } from '../domain/IAnalysisRepository';
import type { IPreference } from '@shared/contracts/analysis/IPreference';
import type { ICharacterClusters } from '@shared/contracts/analysis/ICharacterClusters';
import type { IArchetypePoint } from '@shared/contracts/analysis/IArchetypePoint';
import type { ISynergyMatrix } from '@shared/contracts/analysis/ISynergyMatrix';
import type { ICharacterTacticalUsage } from '@shared/contracts/analysis/ICharacterTacticalUsage';
import type { IPlayerStyleStats } from '@shared/contracts/analysis/IPlayerStyleStats';
import type { SynergyMode } from '@shared/contracts/analysis/value-types';

export default class AnalysisService {
    constructor(
        private analysisRepository: IAnalysisRepository,
        private characterSynergyCalculator: CharacterSynergyCalculator,
        private characterCommunityScanEngine: CharacterCommunityScanEngine,
        private characterRepository: ICharacterRepository,
    ) {}

    async fetchTacticalUsages(): Promise<ICharacterTacticalUsage[]> {
        const matches = await this.analysisRepository.findAllMatchMinimalTimestamps();
        const matcheMoves = await this.analysisRepository.findAllMatchMoveCoreForWeightCalc();
        const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageForAnalysis();
        return computeCharacterTacticalUsage(matches, matcheMoves, matchTacticalUsages);
    }

    async fetchPreference(): Promise<IPreference[]> {
        const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageIdentities();

        // 計算偏好
        const preferenceMap: Record<string, Record<string, number>> = {};

        for (const u of matchTacticalUsages) {
            const playerName = u.memberNickname ?? u.guestNickname ?? u.teamMemberName;
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

    async fetchSynergy(mode: SynergyMode = 'setup'): Promise<ISynergyMatrix> {
        const matchTacticalUsages = await this.analysisRepository.findAllMatchTacticalUsageForAnalysis();
        const groups = this.characterSynergyCalculator.buildCooccurrenceGroups(matchTacticalUsages, mode);
        const synergy = this.characterSynergyCalculator.buildSynergyMatrix(groups);
        return synergy;
    }

    async fetchCharacterClusters(): Promise<ICharacterClusters> {
        const characters = await this.characterRepository.findAll();
        const characterMap = Object.fromEntries(characters.map((character) => [character.key, character]));
        const synergy = await this.fetchSynergy();

        const { archetypes, projected, clusterMedoids, bridgeScores } = await this.characterCommunityScanEngine.computeClusters(
            synergy,
            characterMap,
        );

        const archetypePoints: IArchetypePoint[] = archetypes.map((archetype, i) => ({
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

    async fetchPlayerStyle(memberId: number): Promise<IPlayerStyleStats> {
        const memberMatchMoves = await this.analysisRepository.findMatchMoveHistoryByMemberId(memberId);
        const allMatchMoves = await this.analysisRepository.findAllMatchMoveCoreForWeightCalc();

        return computePlayerStyle(memberMatchMoves, allMatchMoves)
    }
}
