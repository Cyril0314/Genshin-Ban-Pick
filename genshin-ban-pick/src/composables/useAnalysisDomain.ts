// src/composables/useAnalysisDomain.ts

import { analysisService } from "@/network/analysisService";

export function useAnalysisDomain() {
    async function fetchTacticalUsages() {
        const response = await analysisService.getTacticalUsages();
        return response.data;
    }

    async function fetchMeta() {
        const response = await analysisService.getMeta();
        return response.data;
    }

    async function fetchBanPickUtilityStats() {
        const response = await analysisService.getBanPickUtilityStats();
        return response.data;
    }

    async function fetchPreference() {
        const response = await analysisService.getPreference();
        return response.data;
    }

    async function fetchSynergy() {
        const response = await analysisService.getSynergy();
        return response.data;
    }

    async function fetchArchetypes() {
        const response = await analysisService.getArchetypes();
        return response.data;
    }

    async function fetchArchetypeMap() {
        const response = await analysisService.getArchetypeMap();
        return response.data;
    }

    return {
        fetchTacticalUsages,
        fetchMeta,
        fetchBanPickUtilityStats,
        fetchPreference,
        fetchSynergy,
        fetchArchetypes,
        fetchArchetypeMap
    }
}