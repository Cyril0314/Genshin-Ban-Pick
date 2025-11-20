// src/modules/character/types/ICharacter.ts

export interface ICharacter {
  id: number
  key: string
  name: string
  rarity: Rarity
  element: Element
  weapon: Weapon
  region: Region
  modelType: ModelType
  releaseDate: string // 或 Date
  version: string
  role: CharacterRole
  wish: Wish
}

export enum Rarity {
  FourStar = "FourStar",
  FiveStar = "FiveStar",
}

export enum Element {
  Anemo = "Anemo",
  Geo = "Geo",
  Electro = "Electro",
  Dendro = "Dendro",
  Hydro = "Hydro",
  Pyro = "Pyro",
  Cryo = "Cryo",
  None = "None",
}

export enum Weapon {
  Sword = "Sword",
  Claymore = "Claymore",
  Polearm = "Polearm",
  Bow = "Bow",
  Catalyst = "Catalyst",
}

export enum Region {
  Mondstadt = "Mondstadt",
  Liyue = "Liyue",
  Inazuma = "Inazuma",
  Sumeru = "Sumeru",
  Fontaine = "Fontaine",
  Natlan = "Natlan",
  Snezhnaya = "Snezhnaya",
  NodKrai = "NodKrai",
  None = "None",
}

export enum ModelType {
  TallMale = "TallMale",
  TallFemale = "TallFemale",
  MediumMale = "MediumMale",
  MediumFemale = "MediumFemale",
  ShortFemale = "ShortFemale",
  None = "None",
}

export enum CharacterRole {
  MainDPS = "MainDPS",
  SubDPS = "SubDPS",
  Support = "Support",
}

export enum Wish {
  Limited = "Limited",
  Standard = "Standard",
  None = "None",
}