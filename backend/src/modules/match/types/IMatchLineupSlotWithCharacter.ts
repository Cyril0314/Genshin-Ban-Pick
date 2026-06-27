// src/modules/match/types/IMatchLineupSlotWithCharacter.ts

import type { ICharacter } from '@shared/contracts/character/ICharacter';

export interface IMatchLineupSlotWithCharacter {
    characterKey: string;
    character: ICharacter;
}
