// src/modules/character/infrastructure/CharacterRepository.ts

import type CharacterService from './CharacterService';
import type { ICharacter } from '@shared/contracts/character/ICharacter';

export default class CharacterRepository {
    constructor(private characterService: CharacterService) {}

    async fetchCharacterMap(): Promise<Record<string, ICharacter>> {
        const response = await this.characterService.getCharacters();
        const characters = response.data;

        const map: Record<string, ICharacter> = {};
        characters.forEach((char: any) => {
            map[char.key] = char;
        });
        return map;
    }
}