// src/modules/analysis/infrastructure/AnalysisRepository.ts

import { toPlayerIdentityQuery } from '@shared/contracts/analysis/dto/IPlayerIdentityQuery';
import { toAnalysisTimeWindowQuery } from '@shared/contracts/analysis/dto/IAnalysisTimeWindowQuery';

import type AnalysisService from './AnalysisService';

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';
import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';

export default class AnalysisRepository {
    constructor(private analysisService: AnalysisService) {}

    async fetchOverview() {
        const response = await this.analysisService.getOverview();
        return response.data;
    }

    async fetchMatchTimeline(timeWindow?: IAnalysisTimeWindow) {
        const query = timeWindow ? toAnalysisTimeWindowQuery(timeWindow) : undefined
        const response = await this.analysisService.getMatchTimeline(query);
        const matchTimestamps: IMatchTimeMinimal[] = response.data.map((m: any) => ({
            id: m.id,
            createdAt: new Date(m.createdAt)
        }))
        return matchTimestamps;
    }


    async fetchCharacterUsageSummary(timeWindow?: IAnalysisTimeWindow) {
        const query = timeWindow ? toAnalysisTimeWindowQuery(timeWindow) : undefined
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

    async fetchCharacteSynergyMatrix(payload: { mode: SynergyMode }) {
        const response = await this.analysisService.getCharacterSynergyMatrix(payload);
        return response.data;
    }

    async fetchCharacterCluster() {
        const response = await this.analysisService.getCharacterCluster();
        return response.data;
    }

    async fetchPlayerCharacterUsage() {
        const response = await this.analysisService.getPlayerCharacterUsage();
        return response.data;
    }

    async fetchPlayerStyleProfile(playerIdentity: PlayerIdentity) {
        const query = toPlayerIdentityQuery(playerIdentity);
        const response = await this.analysisService.getPlayerStyleProfile(query);
        return response.data;
    }

    async fetchPlayerRecord(playerIdentity: PlayerIdentity) {
        const query = toPlayerIdentityQuery(playerIdentity);
        const response = await this.analysisService.getPlayerRecord(query);
        return response.data;
    }
}
