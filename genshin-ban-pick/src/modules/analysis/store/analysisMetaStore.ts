// src/modules/analysis/store/analysisMetaStore.ts

import { defineStore } from 'pinia';

import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';
import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';
import type { CharacterSynergyMatrix } from '@shared/contracts/analysis/CharacterSynergyMatrix';

export const useAnalysisMetaStore = defineStore('analysisMeta', {
    state: () => ({
        usageMap: {} as Record<string, ICharacterUsage>,
        pickPriorityMap: {} as Record<string, ICharacterPickPriority>,
        synergyMatrix: {} as CharacterSynergyMatrix,
        isInitialized: false,
    }),

    actions: {
        setMeta(payload: {
            usageMap: Record<string, ICharacterUsage>;
            pickPriorityMap: Record<string, ICharacterPickPriority>;
            synergyMatrix: CharacterSynergyMatrix;
        }) {
            this.usageMap = payload.usageMap;
            this.pickPriorityMap = payload.pickPriorityMap;
            this.synergyMatrix = payload.synergyMatrix;
            this.isInitialized = true;
        },
    },
});
