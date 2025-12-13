// src/modules/analysis/types/IMatchTacticalUsageWithCharacter.ts

import { ICharacter } from "@shared/contracts/character/ICharacter";

export interface IMatchTacticalUsageWithCharacter {
    characterKey: string;
    character: ICharacter;
}
