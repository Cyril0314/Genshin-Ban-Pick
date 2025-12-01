// src/modules/character/application/CharacterUseCase.ts

import type { useCharacterStore } from '../store/characterStore';
import type CharacterRepository from '../infrastructure/CharacterRepository';

export default class CharacterUseCase {
    constructor(private characterStore: ReturnType<typeof useCharacterStore>, private characterRepository: CharacterRepository) {}

    async fetchCharacterMap() {
        const characterStore = this.characterStore;

        if (characterStore.isInitialized) {
            return characterStore.characterMap;
        }
        const characterMap = await this.characterRepository.fetchCharacterMap();
        characterStore.setCharacterMap(characterMap);
        return characterMap;
    }
}