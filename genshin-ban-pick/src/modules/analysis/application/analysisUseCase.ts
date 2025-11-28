// src/modules/analysis/application/analysisUseCase.ts

import { fetchTacticalUsagesDomain } from '../domain/fetchTacticalUsagesDomain';
import { fetchPreferenceDomain } from '../domain/fetchPreferenceDomain';
import { fetchSynergyDomain } from '../domain/fetchSynergyDomain';
import { fetchCharacterClustersDomain } from '../domain/useAnalysisDomain';

import type { SynergyMode } from '@shared/contracts/analysis/value-types';

export function analysisUseCase() {
    async function fetchTacticalUsages() {
        return await fetchTacticalUsagesDomain();
    }

    async function fetchPreference() {
        return await fetchPreferenceDomain();
    }

    async function fetchSynergy(payload: { mode: SynergyMode }) {
        return await fetchSynergyDomain(payload);
    }

    async function fetchCharacterClusters() {
        return await fetchCharacterClustersDomain();
    }

    return {
        fetchTacticalUsages,
        fetchPreference,
        fetchSynergy,
        fetchCharacterClusters,
    };
}
