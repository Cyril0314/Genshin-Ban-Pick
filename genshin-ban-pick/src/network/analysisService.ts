// src/network/analysisService.ts

import api from './httpClient';

import type { HttpClient } from './httpClient';

export function createAnalysisService(client: HttpClient = api) {
    
    async function getMeta() {
        return client.get(`/analysis/meta`);
    }

    async function getBanPickUtilityStats() {
        return client.get('/analysis/ban-pick-utility-stats');
    }

    async function getPreference() {
        return client.get('/analysis/preference');
    }

    async function getSynergy() {
        return client.get(`/analysis/synergy`);
    }

    async function getArchetypes() {
        return client.get(`/analysis/archetypes`);
    }

    async function getArchetypeMap() {
        return client.get(`/analysis/archetypeMap`);
    }

    return {
        getMeta,
        getBanPickUtilityStats,
        getPreference,
        getSynergy,
        getArchetypes,
        getArchetypeMap
    };
}

export const analysisService = createAnalysisService();