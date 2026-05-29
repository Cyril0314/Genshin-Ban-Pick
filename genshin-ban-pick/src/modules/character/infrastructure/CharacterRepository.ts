// src/modules/character/infrastructure/CharacterRepository.ts

import type CharacterService from './CharacterService';
import type { ICharacter } from '@shared/contracts/character/ICharacter';

export default class CharacterRepository {
    constructor(private characterService: CharacterService) {}

    async fetchCharacters(): Promise<ICharacter[]> {
        const response = await this.characterService.getCharacters();
        const characters = response.data;

        return characters.map((char: any) => ({
            key: char.key,
            name: char.name,
            rarity: char.rarity,
            element: char.element,
            weapon: char.weapon,
            region: char.region,
            modelType: char.modelType,
            releaseAt: char.releaseAt ? new Date(char.releaseAt) : undefined,
            role: char.role,
            wish: char.wish,
        }));
    }
}