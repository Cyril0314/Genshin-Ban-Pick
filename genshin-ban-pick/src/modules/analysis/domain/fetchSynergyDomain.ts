// src/modules/analysis/domain/useAnalysisDomain.ts

import { analysisService } from "../infrastructure/analysisService";

export async function fetchSynergyDomain(payload: { mode: 'match' | 'team' | 'setup' }) {
    const response = await analysisService.getSynergy(payload);
    return response.data;
}
