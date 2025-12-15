// src/modules/analysis/application/AnalysisUseCase.ts

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type AnalysisRepository from '../infrastructure/AnalysisRepository';
import type { MatchTeamMemberUniqueIdentity } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export default class AnalysisUseCase {
    constructor(private analysisRepository: AnalysisRepository) {}

    async fetchCharacterTacticalUsages() {
        return await this.analysisRepository.fetchCharacterTacticalUsages();
    }

    async fetchCharacterPickPriority() {
        return await this.analysisRepository.fetchCharacterPickPriority();
    }

    async fetchCharacteSynergyMatrix(payload: { mode: SynergyMode }) {
        return await this.analysisRepository.fetchCharacteSynergyMatrix(payload);
    }

    async fetchCharacterSynergyGraph() {
        return await this.analysisRepository.fetchCharacterSynergyGraph();
    }

    async fetchCharacterClusters() {
        return await this.analysisRepository.fetchCharacterClusters();
    }

    async fetchPlayerPreference() {
        return await this.analysisRepository.fetchPlayerPreference();
    }

    async fetchPlayerStyleProfile(payload: { identity: MatchTeamMemberUniqueIdentity }) {
        return await this.analysisRepository.fetchPlayerStyleProfile(payload);
    }
}
