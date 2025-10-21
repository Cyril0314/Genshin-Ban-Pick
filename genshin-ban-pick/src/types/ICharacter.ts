// src/types/ICharacter.ts

export function fromRawCharacter(raw: any): ICharacter {
  return {
    icon: raw.icon,
    name: raw.name,
    rarity: raw.rarity as Rarity,
    element: raw.element as Element,
    weapon: raw.weapon as Weapon,
    region: raw.region as Region,
    modelType: raw.model_type as ModelType,
    releaseDate: raw.release_date,
    version: raw.version,
    role: raw.role as Role,
    wish: raw.wish as Wish
  }
}

export interface ICharacter {
  icon: string
  name: string
  rarity: Rarity
  element: Element
  weapon: Weapon
  region: Region
  modelType: ModelType
  releaseDate: string // 或 Date
  version: string
  role: Role
  wish: Wish
}

export enum Rarity {
  FOUR_STARS = "4 Stars",
  FIVE_STARS = "5 Stars",
}

export enum Element {
  ANEMO = "Anemo",
  GEO = "Geo",
  ELECTRO = "Electro",
  DENDRO = "Dendro",
  HYDRO = "Hydro",
  PYRO = "Pyro",
  CRYO = "Cryo",
  NONE = "None",
}

export enum Weapon {
  SWORD = "Sword",
  CLAYMORE = "Claymore",
  POLEARM = "Polearm",
  BOW = "Bow",
  CATALYST = "Catalyst",
}

export enum Region {
  MONDSTADT = "Mondstadt",
  LIYUE = "Liyue",
  INAZUMA = "Inazuma",
  SUMERU = "Sumeru",
  FONTAINE = "Fontaine",
  NATLAN = "Natlan",
  SNEZHNAYA = "Snezhnaya",
  NOD_KRAI = "NodKrai",
  NONE = "None",
}

export enum ModelType {
  TALL_MALE = "Tall Male",
  TALL_FEMALE = "Tall Female",
  MEDIUM_MALE = "Medium Male",
  MEDIUM_FEMALE = "Medium Female",
  SHORT_FEMALE = "Short Female",
  NONE = "None",
}

export enum Role {
  MAIN_DPS = "Main DPS",
  SUB_DPS = "Sub DPS",
  SUPPORT = "Support",
}

export enum Wish {
  LIMITED_TIME_EVENT = "Limited-Time Event Wish",
  STANDARD = "Standard Wish",
  NONE = "None",
}