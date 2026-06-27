// src/modules/analysis/store/analysisMetaStore.ts

import { defineStore } from 'pinia';

import type { ICharacterUsage } from '@shared/contracts/analysis/ICharacterUsage';
import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';
import type { CharacterCooccurrenceMatrix } from '@shared/contracts/analysis/CharacterCooccurrenceMatrix';

export const useAnalysisMetaStore = defineStore('analysisMeta', {
    // 每片資料的「是否載入」用 nullability 表達（undefined = 未載），不用 isXLoaded flag —— 加新 slice 不必加 flag。
    state: () => ({
        usageMap: undefined as Record<string, ICharacterUsage> | undefined,
        pickPriorityMap: undefined as Record<string, ICharacterPickPriority> | undefined,
        characterCooccurrenceMatrix: undefined as CharacterCooccurrenceMatrix | undefined,
    }),

    actions: {
        setCharacterDictionaries(payload: { usageMap: Record<string, ICharacterUsage>; pickPriorityMap: Record<string, ICharacterPickPriority> }) {
            this.usageMap = payload.usageMap;
            this.pickPriorityMap = payload.pickPriorityMap;
        },
        setCharacterCooccurrenceMatrix(matrix: CharacterCooccurrenceMatrix) {
            this.characterCooccurrenceMatrix = matrix;
        },
    },
});
