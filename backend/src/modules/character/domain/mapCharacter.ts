// src/modules/character/domain/mapCharacter.ts

import type { ICharacter } from "@shared/contracts/character/ICharacter";
import type { Rarity, Element, Weapon, Region, ModelType, CharacterRole, Wish } from "@shared/contracts/character/value-types";

export function mapCharacter(raw: any): ICharacter {
    return {
        id: raw.id,
        key: raw.key,
        name: raw.name,
        rarity: raw.rarity as Rarity,
        element: raw.element as Element,
        weapon: raw.weapon as Weapon,
        region: raw.region as Region,
        modelType: raw.modelType as ModelType,
        releaseDate: raw.releaseDate,
        version: raw.version,
        role: raw.role as CharacterRole,
        wish: raw.wish as Wish,
    };
}