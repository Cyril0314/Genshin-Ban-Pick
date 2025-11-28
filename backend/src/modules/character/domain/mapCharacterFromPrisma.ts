// src/modules/character/domain/mapCharacterFromPrisma

import { Character } from '@prisma/client';

import { Rarity, Element, Weapon, ModelType, CharacterRole, Region, Wish } from '@shared/contracts/character/value-types';
import type { ICharacter } from '@shared/contracts/character/ICharacter';

export function mapCharacterFromPrisma(character: Character): ICharacter {
    return {
        id: character.id,
        key: character.key,
        name: character.name,
        rarity: character.rarity as Rarity,
        element: character.element as Element,
        weapon: character.weapon as Weapon,
        region: character.region as Region,
        modelType: character.modelType as ModelType,
        releaseDate: character.releaseDate,
        version: character.version,
        role: character.role as CharacterRole,
        wish: character.wish as Wish,
    };
}
