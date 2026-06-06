// src/modules/analysis/application/AnalysisUseCase.ts

import type AnalysisRepository from '../infrastructure/AnalysisRepository';
import type { useAnalysisMetaStore } from '../store/analysisMetaStore';
import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';
import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';
import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';

export default class AnalysisUseCase {
    constructor(
        private analysisMetaStore: ReturnType<typeof useAnalysisMetaStore>,
        private analysisRepository: AnalysisRepository,
    ) {}

    async loadCharacterMeta() {
        const store = this.analysisMetaStore;
        if (store.isInitialized) return;

        const [usages, pickPriorities, synergyMatrix] = await Promise.all([
            this.analysisRepository.fetchCharacterUsageSummary(),
            this.analysisRepository.fetchCharacterUsagePickPriority(),
            this.analysisRepository.fetchCharacteSynergyMatrix({ mode: 'setup' }),
        ]);

        const usageMap: Record<string, ICharacterUsage> = {};
        for (const usage of usages) {
            usageMap[usage.characterKey] = usage;
        }

        const pickPriorityMap: Record<string, ICharacterPickPriority> = {};
        for (const pickPriority of pickPriorities) {
            pickPriorityMap[pickPriority.characterKey] = pickPriority;
        }

        store.setMeta({ usageMap, pickPriorityMap, synergyMatrix });
    }

    async fetchOverview() {
        return await this.analysisRepository.fetchOverview();
    }

    async fetchMatchTimeline(timeWindow?: IAnalysisTimeWindow) {
        return await this.analysisRepository.fetchMatchTimeline(timeWindow);
    }

    async fetchCharacterUsageSummary(timeWindow?: IAnalysisTimeWindow) {
        return await this.analysisRepository.fetchCharacterUsageSummary(timeWindow);
    }

    async fetchCharacterUsagePickPriority() {
        return await this.analysisRepository.fetchCharacterUsagePickPriority();
    }

    async fetchCharacteSynergyMatrix(payload: { mode: SynergyMode }) {
        return await this.analysisRepository.fetchCharacteSynergyMatrix(payload);
    }
    
    async fetchCharacterCluster() {
        return await this.analysisRepository.fetchCharacterCluster();
    }

    async fetchPlayerCharacterUsage() {
        return await this.analysisRepository.fetchPlayerCharacterUsage();
    }

    async fetchPlayerStyleProfile(playerIdentity: PlayerIdentity) {
        return await this.analysisRepository.fetchPlayerStyleProfile(playerIdentity);
    }

    async fetchPlayerRecord(playerIdentity: PlayerIdentity) {
        return await this.analysisRepository.fetchPlayerRecord(playerIdentity);
    }

    async fetchCharacterAttributeDistributions(playerIdentity?: PlayerIdentity) {
        return await this.analysisRepository.fetchCharacterAttributeDistributions(playerIdentity);
    }
}
