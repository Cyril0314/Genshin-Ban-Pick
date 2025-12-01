// src/modules/analysis/domain/useAnalysisDomain.ts

import { analysisService } from "../infrastructure/analysisService";

import type { SynergyMode } from '@shared/contracts/analysis/value-types';

export async function fetchSynergyDomain(payload: { mode: SynergyMode }) {
    const response = await analysisService.getSynergy(payload);
    return response.data;
}
