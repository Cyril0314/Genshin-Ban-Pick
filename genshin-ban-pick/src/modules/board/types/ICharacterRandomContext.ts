// src/modules/board/types/ICharacterRandomContext.ts

import type { CharacterFilterKey } from "@/modules/character";

export interface ICharacterRandomContext {
    characterFilter: Record<CharacterFilterKey, string[]>;
}