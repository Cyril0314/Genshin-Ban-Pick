import type { KeyIndexedMatrix } from "./KeyIndexedMatrix";

export type CharacterCooccurrenceMatrix<CharacterKey extends string = string> =
    KeyIndexedMatrix<CharacterKey, CharacterKey>;