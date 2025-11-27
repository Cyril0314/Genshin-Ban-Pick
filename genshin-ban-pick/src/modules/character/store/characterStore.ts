// src/stores/characterStore.ts

import { defineStore } from 'pinia';

import type { ICharacter } from '@shared/contracts/character/ICharacter';

export const useCharacterStore = defineStore('character', {
    state: () => ({
        characterMap: {} as Record<string, ICharacter>,
        isInitialized: false,
    }),

    actions: {
        setCharacterMap(characterMap: Record<string, ICharacter>) {
            this.characterMap = characterMap
            this.isInitialized = true
        },
    }
})