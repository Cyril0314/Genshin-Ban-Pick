// src/composables/useAnalysisDomain.ts

import { analysisService } from "@/network/analysisService";

export function useAnalysisDomain() {
    async function fetchTacticalUsages() {
        const response = await analysisService.getTacticalUsages();
        return response.data;
    }

    async function fetchPreference() {
        const response = await analysisService.getPreference();
        return response.data;
    }

    async function fetchSynergy(payload: { mode: 'match' | 'team' | 'setup' }) {
        const response = await analysisService.getSynergy(payload);
        return response.data;
    }


    async function fetchCharacterClusters() {
        const response = await analysisService.getCharacterClusters();
        return response.data;
    }

    return {
        fetchTacticalUsages,
        fetchPreference,
        fetchSynergy,
        fetchCharacterClusters
    }
}