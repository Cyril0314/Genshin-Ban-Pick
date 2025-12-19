// src/modules/analysis/infrastructure/AnalysisService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';
import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { IPlayerStyleProfileQuery } from '@shared/contracts/analysis/dto/IPlayerStyleProfileQuery';
import type { ICharacterAttributeDistributionsQuery } from '@shared/contracts/analysis/dto/ICharacterAttributeDistributionsQuery';

export default class AnalysisService {
    constructor(private client: HttpClient) {}

    async getOverview() {
        return this.client.get(`/analyses/overview`);
    }

    async getCharacterUsageSummary() {
        return this.client.get(`/analyses/character-usages/summary`);
    }

    async getCharacterUsagePickPriority() {
        return this.client.get(`/analyses/character-usages/pick-priority`);
    }

    async getCharacterAttributeDistributions(query: ICharacterAttributeDistributionsQuery) {
        return this.client.get(`/analyses/character-attribute/distributions`, { params: query });
    }

    async getCharacterSynergyMatrix(payload: { mode: SynergyMode }) {
        return this.client.get(`/analyses/character-synergy/matrix`, { params: payload });
    }

    async getCharacterSynergyGraph() {
        return this.client.get(`/analyses/character-synergy/graph`);
    }

    async getCharacterCluster() {
        return this.client.get(`/analyses/character-cluster`);
    }

    async getPlayerCharacterUsage() {
        return this.client.get('/analyses/player-character-usages');
    }

    async getPlayerStyleProfile(query: IPlayerStyleProfileQuery) {
        return this.client.get(`/analyses/player-style/profile`, { params: query });
    }
}
