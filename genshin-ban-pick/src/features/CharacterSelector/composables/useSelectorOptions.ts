// src/features/CharacterSelector/composables/useSelectorOptions.ts

import { computed } from 'vue'

import type { ICharacter } from '@/types/ICharacter'

import { Element, Weapon, Region, ModelType, Role, Wish, Rarity } from '@/types/ICharacter'

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

export function useSelectorOptions(characterMap: Record<string, ICharacter>) {
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
    [Weapon.SWORD]: '單手劍',
    [Weapon.CLAYMORE]: '雙手劍',
    [Weapon.POLEARM]: '長槍',
    [Weapon.BOW]: '弓',
    [Weapon.CATALYST]: '法器',
  }[weapon]
}

function translateElement(element: Element) {
  return {
    [Element.ANEMO]: '風',
    [Element.GEO]: '岩',
    [Element.ELECTRO]: '雷',
    [Element.DENDRO]: '草',
    [Element.HYDRO]: '水',
    [Element.PYRO]: '火',
    [Element.CRYO]: '冰',
    [Element.NONE]: '無屬性',
  }[element]
}

function translateRegion(region: Region) {
  return {
    [Region.MONDSTADT]: '蒙德',
    [Region.LIYUE]: '璃月',
    [Region.INAZUMA]: '稻妻',
    [Region.SUMERU]: '須彌',
    [Region.FONTAINE]: '楓丹',
    [Region.NATLAN]: '納塔',
    [Region.NOD_KRAI]: '挪德卡萊',
    [Region.SNEZHNAYA]: '至冬',
    [Region.NONE]: '無所屬',
  }[region]
}

function translateRarity(rarity: Rarity) {
  return {
    [Rarity.FIVE_STARS]: '5★',
    [Rarity.FOUR_STARS]: '4★',
  }[rarity]
}

function translateModelType(modelType: ModelType) {
  return {
    [ModelType.TALL_MALE]: '成男',
    [ModelType.TALL_FEMALE]: '成女',
    [ModelType.MEDIUM_MALE]: '少年',
    [ModelType.MEDIUM_FEMALE]: '少女',
    [ModelType.SHORT_FEMALE]: '幼女',
    [ModelType.NONE]: '旅行者',
  }[modelType]
}

function translateRole(role: Role) {
  return {
    [Role.MAIN_DPS]: '主C',
    [Role.SUB_DPS]: '副C',
    [Role.SUPPORT]: '輔助',
  }[role]
}

function translateWish(wish: Wish) {
  return {
    [Wish.LIMITED_TIME_EVENT]: '限定',
    [Wish.STANDARD]: '常駐',
    [Wish.NONE]: '旅行者',
  }[wish]
}

const weaponOrder: Weapon[] = [
  Weapon.SWORD,
  Weapon.CLAYMORE,
  Weapon.POLEARM,
  Weapon.BOW,
  Weapon.CATALYST,
]

const elementOrder = [
  Element.ANEMO,
  Element.GEO,
  Element.ELECTRO,
  Element.DENDRO,
  Element.HYDRO,
  Element.PYRO,
  Element.CRYO,
  Element.NONE,
]

const regionOrder = [
  Region.MONDSTADT,
  Region.LIYUE,
  Region.INAZUMA,
  Region.SUMERU,
  Region.FONTAINE,
  Region.NATLAN,
  Region.NOD_KRAI,
  Region.SNEZHNAYA,
  Region.NONE,
]

const rarityOrder = [Rarity.FIVE_STARS, Rarity.FOUR_STARS]

const modelTypeOrder = [
  ModelType.TALL_MALE,
  ModelType.TALL_FEMALE,
  ModelType.MEDIUM_MALE,
  ModelType.MEDIUM_FEMALE,
  ModelType.SHORT_FEMALE,
  ModelType.NONE,
]

const roleOrder = [Role.MAIN_DPS, Role.SUB_DPS, Role.SUPPORT]
const wishOrder = [Wish.LIMITED_TIME_EVENT, Wish.STANDARD, Wish.NONE]
