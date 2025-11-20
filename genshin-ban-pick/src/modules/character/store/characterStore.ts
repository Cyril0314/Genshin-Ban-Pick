// src/stores/characterStore.ts

import { defineStore } from 'pinia';

import { useCharacterDomain } from '@/modules/character/domain/useCharacterDomain';

import type { ICharacter } from '@/modules/character/types/ICharacter';

export const useCharacterStore = defineStore('character', {
    state: () => ({
        characterMap: {} as Record<string, ICharacter>,
        loaded: false,
    }),

    actions: {
        async loadCharacters() {
            if (this.loaded) return;
            const { fetchCharacterMap } = useCharacterDomain();
            this.characterMap = await fetchCharacterMap();
            this.loaded = true;
        }
    }
})