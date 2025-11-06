// src/composables/useAnalysisDomain.ts

import { analysisService } from "@/network/analysisService";

export function useAnalysisDomain() {
    async function fetchMeta() {
        const response = await analysisService.getMeta();
        return response.data;
    }

    async function fetchPreference() {
        const response = await analysisService.getPreference();
        return response.data;
    }

    async function fetchSynergy() {
        const response = await analysisService.getSynergy();
        const synergy = response.data
        console.log(`synergy`, synergy)
        return response.data;
    }

    return {
        fetchMeta,
        fetchPreference,
        fetchSynergy
    }
}