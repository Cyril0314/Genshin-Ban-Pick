// src/modules/character/domain/ICharacterRepository.ts

import type { ICharacter } from "@shared/contracts/character/ICharacter";

export interface ICharacterRepository {
    findAll(): Promise<ICharacter[]>;
}
