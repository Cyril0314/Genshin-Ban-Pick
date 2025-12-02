import type { CharacterRole, Element, Rarity, Weapon } from '@prisma/client';

export interface IMatchMoveWithCharacter {
    characterKey: string;
    character: {
        role: CharacterRole | null;
        element: Element;
        weapon: Weapon;
        rarity: Rarity;
    };
}
