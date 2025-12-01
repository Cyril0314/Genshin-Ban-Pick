// src/modules/analysis/domain/fetchPreferenceDomain.ts

import { analysisService } from "../infrastructure/analysisService";

export async function fetchPreferenceDomain() {
    const response = await analysisService.getPreference();
    return response.data;
}
