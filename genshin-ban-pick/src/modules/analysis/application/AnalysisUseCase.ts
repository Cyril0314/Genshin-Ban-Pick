// src/modules/analysis/application/AnalysisUseCase.ts

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type AnalysisRepository from '../infrastructure/AnalysisRepository';
import type { MatchTeamMemberUniqueIdentityKey } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export default class AnalysisUseCase {
    constructor(private analysisRepository: AnalysisRepository) {}

    async fetchOverview() {
        return await this.analysisRepository.fetchOverview();
    }

    async fetchCharacterUsageSummary() {
        return await this.analysisRepository.fetchCharacterUsageSummary();
    }

    async fetchCharacterUsagePickPriority() {
        return await this.analysisRepository.fetchCharacterUsagePickPriority();
    }

    async fetchCharacteSynergyMatrix(payload: { mode: SynergyMode }) {
        return await this.analysisRepository.fetchCharacteSynergyMatrix(payload);
    }

    async fetchCharacterSynergyGraph() {
        return await this.analysisRepository.fetchCharacterSynergyGraph();
    }

    async fetchCharacterCluster() {
        return await this.analysisRepository.fetchCharacterCluster();
    }

    async fetchPlayerCharacterUsage() {
        return await this.analysisRepository.fetchPlayerCharacterUsage();
    }

    async fetchPlayerStyleProfile(identityKey: MatchTeamMemberUniqueIdentityKey) {
        return await this.analysisRepository.fetchPlayerStyleProfile(identityKey);
    }

    async fetchGlobalCharacterAttributeDistributions() {
        return await this.analysisRepository.fetchCharacterAttributeDistributions({ type: 'Global' });
    }
}
