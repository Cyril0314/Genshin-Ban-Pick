// src/composables/useCharacterDomain.ts

import { characterNameMap } from '../constants/characterNameMap';
import { characterService } from '../infrastructure/characterService';
import { fromRawCharacter } from '../types/ICharacter';

import type { ICharacter } from '../types/ICharacter';

export async function fetchCharacterMap(): Promise<Record<string, ICharacter>> {
    const response = await characterService.getCharacters();
    const characters = response.data;

    const map: Record<string, ICharacter> = {};
    characters.forEach((char: any) => {
        map[char.key] = fromRawCharacter(char);
    });
    return map;
}

export function getDisplayName(key: string) {
    return characterNameMap[key] ?? key;
}
