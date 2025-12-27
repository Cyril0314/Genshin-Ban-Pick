// src/modules/analysis/infrastructure/AnalysisService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';
import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { IPlayerIdentityQuery } from '@shared/contracts/analysis/dto/IPlayerIdentityQuery';
import type { IAnalysisScopeWithPlayerIdentityQuery } from '@shared/contracts/analysis/dto/IAnalysisScopeWithPlayerIdentityQuery';
import type { IAnalysisTimeWindowQuery } from '@shared/contracts/analysis/dto/IAnalysisTimeWindowQuery';

export default class AnalysisService {
    constructor(private client: HttpClient) {}

    async getOverview() {
        return this.client.get(`/analyses/overview`);
    }

    async getMatchTimeline(query?: IAnalysisTimeWindowQuery) {
        return this.client.get(`/analyses/match-timeline`);
    }

    async getCharacterUsageSummary(query?: IAnalysisTimeWindowQuery) {
        return this.client.get(`/analyses/character-usages/summary`, { params: query });
    }

    async getCharacterUsagePickPriority() {
        return this.client.get(`/analyses/character-usages/pick-priority`);
    }

    async getCharacterAttributeDistributions(query: IAnalysisScopeWithPlayerIdentityQuery) {
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

    async getPlayerStyleProfile(query: IPlayerIdentityQuery) {
        return this.client.get(`/analyses/player-style/profile`, { params: query });
    }
}
