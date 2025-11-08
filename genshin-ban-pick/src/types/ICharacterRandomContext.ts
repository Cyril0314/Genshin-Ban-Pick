// src/types/ICharacterRandomContext.ts

import type { CharacterFilterKey } from "./CharacterFilterKey";

export interface ICharacterRandomContext {
    characterFilter: Record<CharacterFilterKey, string[]>;
}