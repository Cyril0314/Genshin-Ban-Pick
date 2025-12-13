import type { ICharacter } from "./ICharacter";

export const characterFilterKeys = {
  weapon: true,
  element: true,
  region: true,
  rarity: true,
  modelType: true,
  role: true,
  wish: true,
} as const satisfies Partial<Record<keyof ICharacter, boolean>>;

export type CharacterFilterKey = keyof typeof characterFilterKeys;