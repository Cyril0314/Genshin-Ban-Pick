import type { KeyIndexedMatrix } from "./KeyIndexedMatrix";

export type CharacterSynergyMatrix<CharacterKey extends string = string> =
    KeyIndexedMatrix<CharacterKey, CharacterKey>;