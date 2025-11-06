// src/composables/useCharacterDomain.ts

import { characterService } from '@/network/characterService';
import { fromRawCharacter, type ICharacter } from '@/types/ICharacter';

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

    return {
        fetchCharacterMap
    }
}
