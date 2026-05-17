// src/modules/analysis/infrastructure/AnalysisRepository.ts

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type AnalysisService from './AnalysisService';
import type { PlayerIdentity } from '@shared/contracts/player/PlayerIdentity';
import type { IPlayerIdentityQuery } from '@shared/contracts/analysis/dto/IPlayerIdentityQuery';
import type { IAnalysisScopeWithPlayerIdentityQuery } from '@shared/contracts/analysis/dto/IAnalysisScopeWithPlayerIdentityQuery';
import type { IAnalysisTimeWindowQuery } from '@shared/contracts/analysis/dto/IAnalysisTimeWindowQuery';
import type { IAnalysisTimeWindow } from '@shared/contracts/analysis/IAnalysisTimeWindow';
import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';

export default class AnalysisRepository {
    constructor(private analysisService: AnalysisService) {}

    async fetchOverview() {
        const response = await this.analysisService.getOverview();
        return response.data;
    }

    async fetchMatchTimeline(timeWindow?: IAnalysisTimeWindow) {
        var query: IAnalysisTimeWindowQuery = { };
        if (timeWindow?.startAt) {
            query.startAt = timeWindow.startAt.toISOString()
        }
        if (timeWindow?.endAt) {
            query.endAt = timeWindow.endAt.toISOString()
        }
        const response = await this.analysisService.getMatchTimeline(query);
        const matchTimestamps: IMatchTimeMinimal[] = response.data.map((m: any) => ({
            id: m.id,
            createdAt: new Date(m.createdAt)
        }))
        return matchTimestamps;
    }


    async fetchCharacterUsageSummary(timeWindow?: IAnalysisTimeWindow) {
        var query: IAnalysisTimeWindowQuery = { };
        if (timeWindow?.startAt) {
            query.startAt = timeWindow.startAt.toISOString()
        }
        if (timeWindow?.endAt) {
            query.endAt = timeWindow.endAt.toISOString()
        }
        const response = await this.analysisService.getCharacterUsageSummary(query);
        return response.data;
    }

    async fetchCharacterUsagePickPriority() {
        const response = await this.analysisService.getCharacterUsagePickPriority();
        return response.data;
    }

    async fetchCharacterAttributeDistributions(scope: { type: 'Player'; identityKey: PlayerIdentity } | { type: 'Global' }) {
        let query: IAnalysisScopeWithPlayerIdentityQuery;
        switch (scope.type) {
            case 'Global':
                query = {
                    scope: 'global',
                };
                break;
            case 'Player':
                switch (scope.identityKey.type) {
                    case 'Guest':
                        query = {
                            scope: 'player',
                            type: 'guest',
                            id: scope.identityKey.id,
                        };
                        break;
                    case 'Member':
                        query = {
                            scope: 'player',
                            type: 'member',
                            id: scope.identityKey.id,
                        };
                        break;
                    case 'Name':
                        query = {
                            scope: 'player',
                            type: 'name',
                            name: scope.identityKey.name,
                        };
                        break;
                }
                break;
        }
        const response = await this.analysisService.getCharacterAttributeDistributions(query);
        return response.data;
    }

    async fetchCharacteSynergyMatrix(payload: { mode: SynergyMode }) {
        const response = await this.analysisService.getCharacterSynergyMatrix(payload);
        return response.data;
    }

    async fetchCharacterSynergyGraph() {
        const response = await this.analysisService.getCharacterSynergyGraph();
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

    async fetchPlayerStyleProfile(identityKey: PlayerIdentity) {
        const query = toPlayerIdentityQuery(identityKey);
        const response = await this.analysisService.getPlayerStyleProfile(query);
        return response.data;
    }

    async fetchPlayerRecord(identityKey: PlayerIdentity) {
        const query = toPlayerIdentityQuery(identityKey);
        const response = await this.analysisService.getPlayerRecord(query);
        return response.data;
    }
}

function toPlayerIdentityQuery(identityKey: PlayerIdentity): IPlayerIdentityQuery {
    switch (identityKey.type) {
        case 'Guest':
            return { type: 'guest', id: identityKey.id };
        case 'Member':
            return { type: 'member', id: identityKey.id };
        case 'Name':
            return { type: 'name', name: identityKey.name };
    }
}
