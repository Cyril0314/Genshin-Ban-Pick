// src/stores/characterStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';

import { useCharacterDomain } from '@/composables/useCharacterDomain';

import type { ICharacter } from '@/types/ICharacter';

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