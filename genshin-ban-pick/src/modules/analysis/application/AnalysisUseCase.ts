// src/modules/analysis/application/AnalysisUseCase.ts

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type AnalysisRepository from '../infrastructure/AnalysisRepository';

export default class AnalysisUseCase {
    constructor(private analysisRepository: AnalysisRepository) {}

    async fetchTacticalUsages() {
        return await this.analysisRepository.fetchTacticalUsages();
    }

    async fetchPreference() {
        return await this.analysisRepository.fetchPreference();
    }

    async fetchSynergy(payload: { mode: SynergyMode }) {
        return await this.analysisRepository.fetchSynergy(payload);
    }

    async fetchCharacterClusters() {
        return await this.analysisRepository.fetchCharacterClusters();
    }
}