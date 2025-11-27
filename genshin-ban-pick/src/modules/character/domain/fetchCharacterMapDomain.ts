// src/modules/character/domain/fetchCharacterMapDomain.ts

import { characterService } from '../infrastructure/characterService';

import type { ICharacter } from '@shared/contracts/character/ICharacter';

export async function fetchCharacterMapDomain(): Promise<Record<string, ICharacter>> {
    const response = await characterService.getCharacters();
    const characters = response.data;

    const map: Record<string, ICharacter> = {};
    characters.forEach((char: any) => {
        map[char.key] = char;
    });
    return map;
}
