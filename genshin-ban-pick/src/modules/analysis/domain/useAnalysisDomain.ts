// src/modules/analysis/domain/fetchCharacterClustersDomain.ts

import { analysisService } from "../infrastructure/analysisService";

export async function fetchCharacterClustersDomain() {
    const response = await analysisService.getCharacterClusters();
    return response.data;
}