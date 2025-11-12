// src/network/analysisService.ts

import api from './httpClient';

import type { HttpClient } from './httpClient';

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

    async function getArchetypes() {
        return client.get(`/analysis/archetypes`);
    }

    async function getArchetypeMap() {
        return client.get(`/analysis/archetypeMap`);
    }

    return {
        getTacticalUsages,
        getPreference,
        getSynergy,
        getArchetypes,
        getArchetypeMap
    };
}

export const analysisService = createAnalysisService();