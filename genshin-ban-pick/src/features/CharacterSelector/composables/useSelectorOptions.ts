// src/features/CharacterSelector/composables/useSelectorOptions.ts

import { computed } from 'vue'
import type { Character } from '@/types/Character'
import { Element, Weapon, Region, ModelType, Role, Wish, Rarity } from '@/types/Character'

export enum FilterKey {
  Weapon = 'weapon',
  Element = 'element',
  Region = 'region',
  Rarity = 'rarity',
  ModelType = 'model_type',
  Role = 'role',
  Wish = 'wish',
}

export interface SelectorOption {
  key: FilterKey
  label: string
  items: string[]
  translateFn: (val: string) => string
}

export function useSelectorOptions(characterMap: Record<string, Character>) {
  const characters = computed(() =>
    Object.values(characterMap).filter((c) => c.name.toLowerCase() !== 'traveler'),
  )

  return computed(() => [
    {
      key: FilterKey.Weapon,
      label: '選擇武器',
      items: uniqueByKey(characters.value, FilterKey.Weapon, weaponOrder),
      translateFn: (v: string) => translateWeapon(v as Weapon),
    },
    {
      key: FilterKey.Element,
      label: '選擇屬性',
      items: uniqueByKey(characters.value, FilterKey.Element, elementOrder),
      translateFn: (v: string) => translateElement(v as Element),
    },
    {
      key: FilterKey.Region,
      label: '選擇國家',
      items: uniqueByKey(characters.value, FilterKey.Region, regionOrder),
      translateFn: (v: string) => translateRegion(v as Region),
    },
    {
      key: FilterKey.ModelType,
      label: '選擇體型',
      items: uniqueByKey(characters.value, FilterKey.ModelType, modelTypeOrder),
      translateFn: (v: string) => translateModelType(v as ModelType),
    },
    {
      key: FilterKey.Role,
      label: '選擇功能',
      items: uniqueByKey(characters.value, FilterKey.Role, roleOrder),
      translateFn: (v: string) => translateRole(v as Role),
    },
    {
      key: FilterKey.Wish,
      label: '選擇祈願',
      items: uniqueByKey(characters.value, FilterKey.Wish, wishOrder),
      translateFn: (v: string) => translateWish(v as Wish),
    },
    {
      key: FilterKey.Rarity,
      label: '選擇星級',
      items: uniqueByKey(characters.value, FilterKey.Rarity, rarityOrder),
      translateFn: (v: string) => translateRarity(v as Rarity),
    },
  ])
}

function uniqueByKey<T, K extends keyof T>(data: T[], key: K, orderArray: T[K][]): T[K][] {
  const uniqueSet = new Set(data.map((item) => item[key]))
  if (orderArray.length === 0) return [...uniqueSet]
  return orderArray.filter((item) => uniqueSet.has(item)) // 一個指定順序的陣列
}

// --- Translate & Order ---

function translateWeapon(weapon: Weapon) {
  return {
    [Weapon.Sword]: '單手劍',
    [Weapon.Claymore]: '雙手劍',
    [Weapon.Polearm]: '長槍',
    [Weapon.Bow]: '弓',
    [Weapon.Catalyst]: '法器',
  }[weapon]
}

function translateElement(element: Element) {
  return {
    [Element.Anemo]: '風',
    [Element.Geo]: '岩',
    [Element.Electro]: '雷',
    [Element.Dendro]: '草',
    [Element.Hydro]: '水',
    [Element.Pyro]: '火',
    [Element.Cryo]: '冰',
    [Element.None]: '無屬性',
  }[element]
}

function translateRegion(region: Region) {
  return {
    [Region.Mondstadt]: '蒙德',
    [Region.Liyue]: '璃月',
    [Region.Inazuma]: '稻妻',
    [Region.Sumeru]: '須彌',
    [Region.Fontaine]: '楓丹',
    [Region.Natlan]: '納塔',
    [Region.NodKrai]: '挪德卡萊',
    [Region.Snezhnaya]: '至冬',
    [Region.None]: '無所屬',
  }[region]
}

function translateRarity(rarity: Rarity) {
  return {
    [Rarity.FiveStars]: '5★',
    [Rarity.FourStars]: '4★',
  }[rarity]
}

function translateModelType(modelType: ModelType) {
  return {
    [ModelType.TallMale]: '成男',
    [ModelType.TallFemale]: '成女',
    [ModelType.MediumMale]: '少年',
    [ModelType.MediumFemale]: '少女',
    [ModelType.ShortFemale]: '幼女',
    [ModelType.None]: '旅行者',
  }[modelType]
}

function translateRole(role: Role) {
  return {
    [Role.MainDPS]: '主C',
    [Role.SubDPS]: '副C',
    [Role.Support]: '輔助',
  }[role]
}

function translateWish(wish: Wish) {
  return {
    [Wish.LimitedTimeEvent]: '限定',
    [Wish.Standard]: '常駐',
    [Wish.None]: '旅行者',
  }[wish]
}

const weaponOrder: Weapon[] = [
  Weapon.Sword,
  Weapon.Claymore,
  Weapon.Polearm,
  Weapon.Bow,
  Weapon.Catalyst,
]

const elementOrder = [
  Element.Anemo,
  Element.Geo,
  Element.Electro,
  Element.Dendro,
  Element.Hydro,
  Element.Pyro,
  Element.Cryo,
  Element.None,
]

const regionOrder = [
  Region.Mondstadt,
  Region.Liyue,
  Region.Inazuma,
  Region.Sumeru,
  Region.Fontaine,
  Region.Natlan,
  Region.NodKrai,
  Region.Snezhnaya,
  Region.None,
]

const rarityOrder = [Rarity.FiveStars, Rarity.FourStars]

const modelTypeOrder = [
  ModelType.TallMale,
  ModelType.TallFemale,
  ModelType.MediumMale,
  ModelType.MediumFemale,
  ModelType.ShortFemale,
  ModelType.None,
]

const roleOrder = [Role.MainDPS, Role.SubDPS, Role.Support]
const wishOrder = [Wish.LimitedTimeEvent, Wish.Standard, Wish.None]
