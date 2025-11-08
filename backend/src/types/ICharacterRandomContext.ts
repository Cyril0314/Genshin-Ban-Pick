// backend/src/types/ICharacterRandomContext.ts

import { CharacterFilterKey } from "./CharacterFilterKey.ts";

export interface ICharacterRandomContext {
    characterFilter: Record<CharacterFilterKey, string[]>;
}