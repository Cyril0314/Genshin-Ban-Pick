// src/modules/character/application/CharacterUseCase.ts

import type { useCharacterStore } from '../store/characterStore';
import type CharacterRepository from '../infrastructure/CharacterRepository';
import type { ICharacter } from '@shared/contracts/character/ICharacter';

export default class CharacterUseCase {
    constructor(private characterStore: ReturnType<typeof useCharacterStore>, private characterRepository: CharacterRepository) {}

    async loadCharacterMap() {
        const characterStore = this.characterStore;
        if (characterStore.isInitialized) return;

        const characters = await this.characterRepository.fetchCharacters();
        const characterMap: Record<string, ICharacter> = {};
        for (const character of characters) {
            characterMap[character.key] = character;
        }
        characterStore.setCharacterMap(characterMap);
    }
}