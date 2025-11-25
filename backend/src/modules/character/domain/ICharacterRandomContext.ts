// backend/src/modules/character/domain/ICharacterRandomContext.ts

import { CharacterFilterKey } from "../types/CharacterFilterKey.ts";

export interface ICharacterRandomContext {
    characterFilter: Record<CharacterFilterKey, string[]>;
}