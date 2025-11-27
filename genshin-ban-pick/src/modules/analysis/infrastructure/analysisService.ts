// src/modules/analysis/infrastructure/analysisService.ts

import api from '@/app/infrastructure/http/httpClient';

import type { HttpClient } from '@/app/infrastructure/http/httpClient';

export function createAnalysisService(client: HttpClient = api) {
    async function getTacticalUsages() {
        return client.get(`/analyses/tactical-usages`);
    }

    async function getPreference() {
        return client.get('/analyses/preference');
    }

    async function getSynergy(payload: { mode: 'match' | 'team' | 'setup' }) {
        return client.get(`/analyses/synergy`, { params: payload });
    }

    async function getCharacterClusters() {
        return client.get(`/analyses/character-clusters`);
    }

    return {
        getTacticalUsages,
        getPreference,
        getSynergy,
        getCharacterClusters,
    };
}

export const analysisService = createAnalysisService();
