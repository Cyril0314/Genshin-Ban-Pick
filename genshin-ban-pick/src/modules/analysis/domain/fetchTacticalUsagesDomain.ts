// src/modules/analysis/domain/fetchTacticalUsagesDomain.ts

import { analysisService } from "../infrastructure/analysisService";

export async function fetchTacticalUsagesDomain() {
    const response = await analysisService.getTacticalUsages();
    return response.data;
}