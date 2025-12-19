// src/modules/analysis/infrastructure/AnalysisRepository.ts

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type AnalysisService from './AnalysisService';
import type { MatchTeamMemberUniqueIdentityKey } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';
import type { IPlayerStyleProfileQuery } from '@shared/contracts/analysis/dto/IPlayerStyleProfileQuery';
import type { ICharacterAttributeDistributionsQuery } from '@shared/contracts/analysis/dto/ICharacterAttributeDistributionsQuery';

export default class AnalysisRepository {
    constructor(private analysisService: AnalysisService) {}

    async fetchOverview() {
        const response = await this.analysisService.getOverview();
        return response.data;
    }

    async fetchCharacterUsageSummary() {
        const response = await this.analysisService.getCharacterUsageSummary();
        return response.data;
    }

    async fetchCharacterUsagePickPriority() {
        const response = await this.analysisService.getCharacterUsagePickPriority();
        return response.data;
    }

    async fetchCharacterAttributeDistributions(scope: { type: 'Player'; identityKey: MatchTeamMemberUniqueIdentityKey } | { type: 'Global' }) {
        let query: ICharacterAttributeDistributionsQuery;
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

    async fetchPlayerStyleProfile(identityKey: MatchTeamMemberUniqueIdentityKey) {
        let query: IPlayerStyleProfileQuery;
        switch (identityKey.type) {
            case 'Guest':
                query = {
                    type: 'guest',
                    id: identityKey.id,
                };
                break;
            case 'Member':
                query = {
                    type: 'member',
                    id: identityKey.id,
                };
                break;
            case 'Name':
                query = {
                    type: 'name',
                    name: identityKey.name,
                };
                break;
        }
        const response = await this.analysisService.getPlayerStyleProfile(query);
        return response.data;
    }
}
