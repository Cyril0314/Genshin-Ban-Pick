// src/modules/character/domain/ICharacterRepository.ts

import { ICharacter } from "@shared/contracts/character/ICharacter";

export default interface ICharacterRepository {
    findAll(): Promise<ICharacter[]>;
}
