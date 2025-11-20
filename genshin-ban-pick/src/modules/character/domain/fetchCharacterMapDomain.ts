// src/modules/character/domain/fetchCharacterMapDomain.ts

import { characterService } from '../infrastructure/characterService';

import type { ICharacter, Rarity, Element, Weapon, ModelType, CharacterRole, Region, Wish } from '../types/ICharacter';

export async function fetchCharacterMapDomain(): Promise<Record<string, ICharacter>> {
    const response = await characterService.getCharacters();
    const characters = response.data;

    const map: Record<string, ICharacter> = {};
    characters.forEach((char: any) => {
        map[char.key] = fromRawCharacter(char);
    });
    return map;
}

export function fromRawCharacter(raw: any): ICharacter {
    return {
        id: raw.id,
        key: raw.key,
        name: raw.name,
        rarity: raw.rarity as Rarity,
        element: raw.element as Element,
        weapon: raw.weapon as Weapon,
        region: raw.region as Region,
        modelType: raw.modelType as ModelType,
        releaseDate: raw.release_date,
        version: raw.version,
        role: raw.role as CharacterRole,
        wish: raw.wish as Wish,
    };
}
