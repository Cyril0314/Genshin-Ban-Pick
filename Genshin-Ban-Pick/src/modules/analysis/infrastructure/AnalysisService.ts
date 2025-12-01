// src/modules/analysis/infrastructure/AnalysisService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';
import type { SynergyMode } from '@shared/contracts/analysis/value-types';

export default class AnalysisService {
    constructor(private client: HttpClient) {}

    async getTacticalUsages() {
        return this.client.get(`/analyses/tactical-usages`);
    }

    async getPreference() {
        return this.client.get('/analyses/preference');
    }

    async getSynergy(payload: { mode: SynergyMode }) {
        return this.client.get(`/analyses/synergy`, { params: payload });
    }

    async getCharacterClusters() {
        return this.client.get(`/analyses/character-clusters`);
    }
}