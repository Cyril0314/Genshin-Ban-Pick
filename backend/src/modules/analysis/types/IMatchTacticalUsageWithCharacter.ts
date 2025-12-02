// src/modules/analysis/types/IMatchTacticalUsageWithCharacter.ts

import type { CharacterRole, Element, Rarity, Weapon } from '@prisma/client';

export interface IMatchTacticalUsageWithCharacter {
    characterKey: string;
    character: {
        role: CharacterRole;
        element: Element;
        weapon: Weapon;
        rarity: Rarity;
    };
}
