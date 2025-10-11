// src/types/ICharacter.ts

export interface ICharacter {
  icon: string
  name: string
  rarity: Rarity
  element: Element
  weapon: Weapon
  region: Region
  model_type: ModelType
  release_date: string // 或 Date
  version: string
  role: Role
  wish: Wish
}

export enum Rarity {
  FourStars = "4 Stars",
  FiveStars = "5 Stars",
}

export enum Element {
  Anemo = "Anemo",
  Geo = "Geo",
  Electro = "Electro",
  Dendro = "Dendro",
  Cryo = "Cryo",
  Hydro = "Hydro",
  Pyro = "Pyro",
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
  TallMale = "Tall Male",
  TallFemale = "Tall Female",
  MediumMale = "Medium Male",
  MediumFemale = "Medium Female",
  ShortFemale = "Short Female",
  None = "None",
}

export enum Role {
  MainDPS = "Main DPS",
  SubDPS = "Sub DPS",
  Support = "Support",
}

export enum Wish {
  LimitedTimeEvent = "Limited-Time Event Wish",
  Standard = "Standard Wish",
  None = "None",
}