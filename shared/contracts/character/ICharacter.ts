// src/modules/character/types/ICharacter.ts

import { CharacterRole, Element, ModelType, Rarity, Region, Weapon, Wish } from "./value-types"

export interface ICharacter {
  id: number
  key: string
  name: string
  rarity: Rarity
  element: Element
  weapon: Weapon
  region: Region
  modelType: ModelType
  releaseDate: Date | null
  version: string | null
  role: CharacterRole
  wish: Wish
}
