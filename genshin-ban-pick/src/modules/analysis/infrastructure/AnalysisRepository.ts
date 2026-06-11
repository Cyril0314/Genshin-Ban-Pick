// src/modules/analysis/infrastructure/AnalysisRepository.ts

import { toTimeWindowQuery } from '@shared/contracts/common/dto/ITimeWindowQuery';
import { toPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';

import type AnalysisService from './AnalysisService';
import type { CooccurrenceGrain } from '@shared/contracts/analysis/value-types';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export default class AnalysisRepository {
    constructor(private analysisService: AnalysisService) {}

    async fetchOverview() {
        const response = await this.analysisService.getOverview();
        return response.data;
    }

    async fetchCharacterUsageSummary(timeWindow?: ITimeWindow) {
        const query = timeWindow ? toTimeWindowQuery(timeWindow) : undefined
        const response = await this.analysisService.getCharacterUsageSummary(query);
        return response.data;
    }

    async fetchCharacterUsagePickPriority() {
        const response = await this.analysisService.getCharacterUsagePickPriority();
        return response.data;
    }

    async fetchCharacterAttributeDistributions(playerIdentity?: PlayerIdentity) {
        const query = playerIdentity ? toPlayerIdentityQuery(playerIdentity) : undefined;
        const response = await this.analysisService.getCharacterAttributeDistributions(query);
        return response.data;
    }

    async fetchCharacterCooccurrenceMatrix(payload: { grain: CooccurrenceGrain }) {
        const response = await this.analysisService.getCharacterCooccurrenceMatrix(payload);
        return response.data;
    }

    async fetchCharacterCluster() {
        const response = await this.analysisService.getCharacterCluster();
        return response.data;
    }

    async fetchPlayerStyle(playerIdentity: PlayerIdentity) {
        const query = toPlayerIdentityQuery(playerIdentity);
        const response = await this.analysisService.getPlayerStyle(query);
        return response.data;
    }
}
