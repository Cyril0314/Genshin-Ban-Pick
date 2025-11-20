// src/network/analysisService.ts

import api from '../infrastructure/http/httpClient';

import type { HttpClient } from '../infrastructure/http/httpClient';

export function createAnalysisService(client: HttpClient = api) {
    async function getTacticalUsages() {
        return client.get(`/analysis/tactical-usages`);
    }

    async function getPreference() {
        return client.get('/analysis/preference');
    }

    async function getSynergy(payload: { mode: 'match' | 'team' | 'setup' }) {
        return client.get(`/analysis/synergy`, { params: payload });
    }

    async function getCharacterClusters() {
        return client.get(`/analysis/character-clusters`);
    }

    return {
        getTacticalUsages,
        getPreference,
        getSynergy,
        getCharacterClusters,
    };
}

export const analysisService = createAnalysisService();
