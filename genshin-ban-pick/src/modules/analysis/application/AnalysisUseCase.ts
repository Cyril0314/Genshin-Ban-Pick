// src/modules/analysis/application/AnalysisUseCase.ts

import type AnalysisRepository from '../infrastructure/AnalysisRepository';
import type { useAnalysisMetaStore } from '../store/analysisMetaStore';
import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';
import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';
import type { CooccurrenceGrain } from '@shared/contracts/analysis/value-types';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export default class AnalysisUseCase {
    constructor(
        private analysisMetaStore: ReturnType<typeof useAnalysisMetaStore>,
        private analysisRepository: AnalysisRepository,
    ) {}

    // 只載共現矩陣（冪等）。供只需要矩陣的頁面（playerProfile）用，避免連帶抓 usage/pickPriority 兩個字典。
    async loadCharacterCooccurrenceMatrix() {
        const store = this.analysisMetaStore;
        if (store.characterCooccurrenceMatrix) return; // 已載（資料在即載過）

        const matrix = await this.analysisRepository.fetchCharacterCooccurrenceMatrix({ grain: 'setup' });
        store.setCharacterCooccurrenceMatrix(matrix);
    }

    async loadCharacterMeta() {
        const store = this.analysisMetaStore;
        if (store.usageMap) return; // 字典已載

        const [usages, pickPriorities] = await Promise.all([
            this.analysisRepository.fetchCharacterUsageSummary(),
            this.analysisRepository.fetchCharacterUsagePickPriority(),
            this.loadCharacterCooccurrenceMatrix(), // 矩陣冪等載入，與字典並行；若 playerProfile 已載則跳過
        ]);

        const usageMap: Record<string, ICharacterUsage> = {};
        for (const usage of usages) {
            usageMap[usage.characterKey] = usage;
        }

        const pickPriorityMap: Record<string, ICharacterPickPriority> = {};
        for (const pickPriority of pickPriorities) {
            pickPriorityMap[pickPriority.characterKey] = pickPriority;
        }

        store.setCharacterDictionaries({ usageMap, pickPriorityMap });
    }

    async fetchOverview() {
        return await this.analysisRepository.fetchOverview();
    }

    async fetchCharacterUsageSummary(timeWindow?: ITimeWindow) {
        return await this.analysisRepository.fetchCharacterUsageSummary(timeWindow);
    }

    async fetchCharacterUsagePickPriority() {
        return await this.analysisRepository.fetchCharacterUsagePickPriority();
    }

    async fetchCharacterCluster() {
        return await this.analysisRepository.fetchCharacterCluster();
    }

    async fetchPlayerStyle(playerIdentity: PlayerIdentity) {
        return await this.analysisRepository.fetchPlayerStyle(playerIdentity);
    }

    async fetchCharacterAttributeDistributions(playerIdentity?: PlayerIdentity) {
        return await this.analysisRepository.fetchCharacterAttributeDistributions(playerIdentity);
    }
}
