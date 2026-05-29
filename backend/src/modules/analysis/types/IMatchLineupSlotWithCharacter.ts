// src/modules/analysis/types/IMatchLineupSlotWithCharacter.ts

import { ICharacter } from "@shared/contracts/character/ICharacter";

export interface IMatchLineupSlotWithCharacter {
    characterKey: string;
    character: ICharacter;
}
