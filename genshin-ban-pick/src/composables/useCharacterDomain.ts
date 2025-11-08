// src/composables/useCharacterDomain.ts

import { characterNameMap } from '@/constants/characterNameMap';
import { characterService } from '@/network/characterService';
import { fromRawCharacter } from '@/types/ICharacter';

import type { ICharacter } from '@/types/ICharacter';

export function useCharacterDomain() {
    async function fetchCharacterMap(): Promise<Record<string, ICharacter>> {
        const response = await characterService.getCharacters();
        const characters = response.data;

        const map: Record<string, ICharacter> = {};
        characters.forEach((char: any) => {
            map[char.key] = fromRawCharacter(char);
        });
        return map;
    }

    function getDisplayName(key: string) {
        return characterNameMap[key] ?? key;
    }

    return {
        fetchCharacterMap,
        getDisplayName,
    };
}
