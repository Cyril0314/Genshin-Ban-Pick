// src/network/analysisService.ts

import api from './httpClient';

import type { HttpClient } from './httpClient';

export function createAnalysisService(client: HttpClient = api) {
    
    async function getMeta() {
        return client.get(`/analysis/meta`);
    }

    async function getPreference() {
        return client.get('/analysis/preference');
    }

    async function getSynergy() {
        return client.get(`/analysis/synergy`);
    }

    return {
        getMeta,
        getPreference,
        getSynergy,
    };
}

export const analysisService = createAnalysisService();