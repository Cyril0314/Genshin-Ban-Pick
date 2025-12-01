// src/modules/analysis/infrastructure/AnalysisRepository.ts

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type AnalysisService from './AnalysisService';

export default class AnalysisRepository {
    constructor(private analysisService: AnalysisService) {}

    async fetchPreference() {
        const response = await this.analysisService.getPreference();
        return response.data;
    }

    async fetchSynergy(payload: { mode: SynergyMode }) {
        const response = await this.analysisService.getSynergy(payload);
        return response.data;
    }

    async fetchTacticalUsages() {
        const response = await this.analysisService.getTacticalUsages();
        return response.data;
    }

    async fetchCharacterClusters() {
        const response = await this.analysisService.getCharacterClusters();
        return response.data;
    }
}