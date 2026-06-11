// src/modules/analysis/infrastructure/AnalysisService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';
import type { CooccurrenceGrain } from '@shared/contracts/analysis/value-types';
import type { ITimeWindowQuery } from '@shared/contracts/common/dto/ITimeWindowQuery';
import type { IPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';

export default class AnalysisService {
    constructor(private client: HttpClient) {}

    async getMatchOverview() {
        return this.client.get(`/analyses/match-overview`);
    }

    async getCharacterUsageSummary(query?: ITimeWindowQuery) {
        return this.client.get(`/analyses/character-usages/summary`, { params: query });
    }

    async getCharacterUsagePickPriority() {
        return this.client.get(`/analyses/character-usages/pick-priority`);
    }

    async getCharacterAttributeDistributions(query?: IPlayerIdentityQuery) {
        return this.client.get(`/analyses/character-attribute/distributions`, { params: query });
    }

    async getCharacterCooccurrenceMatrix(payload: { grain: CooccurrenceGrain }) {
        return this.client.get(`/analyses/character-cooccurrence/matrix`, { params: payload });
    }

    async getCharacterSimilarityGraph() {
        return this.client.get(`/analyses/character-similarity/graph`);
    }

    async getCharacterCluster() {
        return this.client.get(`/analyses/character-cluster`);
    }

    async getPlayerCharacterUsage() {
        return this.client.get('/analyses/player-character-usages');
    }

    async getPlayerStyle(query: IPlayerIdentityQuery) {
        return this.client.get(`/analyses/player-styles`, { params: query });
    }
}
