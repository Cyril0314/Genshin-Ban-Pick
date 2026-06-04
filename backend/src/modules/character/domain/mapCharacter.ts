// src/modules/character/domain/mapCharacter.ts

import type { ICharacter } from "@shared/contracts/character/ICharacter";
import type { Rarity, Element, Weapon, Region, ModelType, CharacterRole, Wish } from "@shared/contracts/character/value-types";

// character 資料表 row 的結構型投影（不依賴 Prisma），讓 mapper 保持 ORM 無關、可跨模組共用。
export interface ICharacterRow {
    key: string;
    name: string;
    rarity: string;
    element: string;
    weapon: string;
    region: string;
    modelType: string;
    role: string;
    wish: string;
    releaseAt: Date | null;
}

export function mapCharacter(raw: ICharacterRow): ICharacter {
    return {
        key: raw.key,
        name: raw.name,
        rarity: raw.rarity as Rarity,
        element: raw.element as Element,
        weapon: raw.weapon as Weapon,
        region: raw.region as Region,
        modelType: raw.modelType as ModelType,
        releaseAt: raw.releaseAt ?? undefined,
        role: raw.role as CharacterRole,
        wish: raw.wish as Wish,
    };
}