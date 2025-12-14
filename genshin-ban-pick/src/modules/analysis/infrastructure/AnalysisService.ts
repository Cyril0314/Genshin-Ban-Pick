// src/modules/analysis/infrastructure/AnalysisService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';
import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { MatchTeamMemberUniqueIdentity } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export default class AnalysisService {
    constructor(private client: HttpClient) {}

    async getTacticalUsages() {
        return this.client.get(`/analyses/tactical-usages`);
    }

    async getCharacterSynergyMatrix(payload: { mode: SynergyMode }) {
        return this.client.get(`/analyses/character/synergy-matrix`, { params: payload });
    }

    async getCharacterSynergyGraph() {
        return this.client.get(`/analyses/character/synergy-graph`);
    }
    
    async getCharacterClusters() {
        return this.client.get(`/analyses/character/clusters`);
    }

    async getPlayerPreference() {
        return this.client.get('/analyses/player/preference');
    }

    async getPlayerStyleProfile(payload: { identity: MatchTeamMemberUniqueIdentity }) {
        return this.client.get(`/analyses/player/style-profile`, { params: payload });
    }
}
