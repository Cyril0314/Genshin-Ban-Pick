// src/modules/analysis/infrastructure/AnalysisRepository.ts

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type AnalysisService from './AnalysisService';
import type { MatchTeamMemberUniqueIdentity } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export default class AnalysisRepository {
    constructor(private analysisService: AnalysisService) {}

    async fetchCharacterTacticalUsages() {
        const response = await this.analysisService.getCharacterTacticalUsages();
        return response.data;
    }

    async fetchCharacterPickPriority() {
        const response = await this.analysisService.getCharacterPickPriority();
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

    async fetchCharacterClusters() {
        const response = await this.analysisService.getCharacterClusters();
        return response.data;
    }

    async fetchPlayerPreference() {
        const response = await this.analysisService.getPlayerPreference();
        return response.data;
    }

    async fetchPlayerStyleProfile(payload: { identity: MatchTeamMemberUniqueIdentity }) {
        const response = await this.analysisService.getPlayerStyleProfile(payload);
        return response.data;
    }
}
