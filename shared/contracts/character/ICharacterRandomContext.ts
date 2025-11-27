import { CharacterFilterKey } from "./value-types";

export interface ICharacterRandomContext {
    characterFilter: Record<CharacterFilterKey, string[]>;
}