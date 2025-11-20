// src/modules/character/application/characterUseCase.ts

import { fetchCharacterMapDomain } from '../domain/fetchCharacterMapDomain';
import { useCharacterStore } from '../store/characterStore';

export function characterUseCase() {
    const characterStore = useCharacterStore();

    async function fetchCharacterMap() {
        if (characterStore.isInitialized) {
            return characterStore.characterMap;
        }
        const characterMap = await fetchCharacterMapDomain();
        characterStore.setCharacterMap(characterMap);
        return characterMap;
    }

    return {
        fetchCharacterMap,
    }
}
