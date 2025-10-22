// src/features/CharacterSelector/composables/useSelectorOptions.ts
import { Element, Weapon, Region, ModelType, Role, Wish, Rarity } from '@/types/ICharacter'

import { CharacterFilterKey } from '@/types/CharacterFilterKey'
import type { ICharacter } from '@/types/ICharacter'

export interface SelectorOption {
  key: CharacterFilterKey
  label: string
  items: string[]
  translateFn: (val: string) => string
}

export enum CommonOption {
  ALL = 'All',
}

export function useSelectorOptions(characterMap: Record<string, ICharacter>): SelectorOption[] {
  const characters = Object.values(characterMap).filter((c) => c.name.toLowerCase() !== 'traveler')

  return [
    {
      key: CharacterFilterKey.Weapon,
      label: '選擇武器',
      items: [...uniqueByKey(characters, CharacterFilterKey.Weapon, weaponOrder), CommonOption.ALL],
      translateFn: (v: string) => translateWeapon(v),
    },
    {
      key: CharacterFilterKey.Element,
      label: '選擇屬性',
      items: [...uniqueByKey(characters, CharacterFilterKey.Element, elementOrder), CommonOption.ALL],
      translateFn: (v: string) => translateElement(v),
    },
    {
      key: CharacterFilterKey.Region,
      label: '選擇國家',
      items: [...uniqueByKey(characters, CharacterFilterKey.Region, regionOrder), CommonOption.ALL],
      translateFn: (v: string) => translateRegion(v),
    },
    {
      key: CharacterFilterKey.ModelType,
      label: '選擇體型',
      items: [...uniqueByKey(characters, CharacterFilterKey.ModelType, modelTypeOrder), CommonOption.ALL],
      translateFn: (v: string) => translateModelType(v),
    },
    {
      key: CharacterFilterKey.Role,
      label: '選擇功能',
      items: [...uniqueByKey(characters, CharacterFilterKey.Role, roleOrder), CommonOption.ALL],
      translateFn: (v: string) => translateRole(v),
    },
    {
      key: CharacterFilterKey.Wish,
      label: '選擇祈願',
      items: [...uniqueByKey(characters, CharacterFilterKey.Wish, wishOrder), CommonOption.ALL],
      translateFn: (v: string) => translateWish(v),
    },
    {
      key: CharacterFilterKey.Rarity,
      label: '選擇星級',
      items: [...uniqueByKey(characters, CharacterFilterKey.Rarity, rarityOrder), CommonOption.ALL],
      translateFn: (v: string) => translateRarity(v),
    },
  ]
}

function uniqueByKey<T, K extends keyof T>(data: T[], key: K, orderArray: T[K][]): T[K][] {
  const uniqueSet = new Set(data.map((item) => item[key]))
  if (orderArray.length === 0) return [...uniqueSet]
  return orderArray.filter((item) => uniqueSet.has(item)) // 一個指定順序的陣列
}

// --- Translate & Order ---

function translateWeapon(weapon: string) {
  return {
    [Weapon.SWORD]: '單手劍',
    [Weapon.CLAYMORE]: '雙手劍',
    [Weapon.POLEARM]: '長槍',
    [Weapon.BOW]: '弓',
    [Weapon.CATALYST]: '法器',
    [CommonOption.ALL]: '所有',
  }[weapon] ?? '未定義'
}

function translateElement(element: string) {
  return {
    [Element.ANEMO]: '風',
    [Element.GEO]: '岩',
    [Element.ELECTRO]: '雷',
    [Element.DENDRO]: '草',
    [Element.HYDRO]: '水',
    [Element.PYRO]: '火',
    [Element.CRYO]: '冰',
    [Element.NONE]: '無屬性',
    [CommonOption.ALL]: '所有',
  }[element] ?? '未定義'
}

function translateRegion(region: string) {
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
    [CommonOption.ALL]: '所有',
  }[region] ?? '未定義'
}

function translateRarity(rarity: string) {
  return {
    [Rarity.FIVE_STARS]: '5★',
    [Rarity.FOUR_STARS]: '4★',
    [CommonOption.ALL]: '所有',
  }[rarity] ?? '未定義'
}

function translateModelType(modelType: string) {
  return {
    [ModelType.TALL_MALE]: '成男',
    [ModelType.TALL_FEMALE]: '成女',
    [ModelType.MEDIUM_MALE]: '少年',
    [ModelType.MEDIUM_FEMALE]: '少女',
    [ModelType.SHORT_FEMALE]: '幼女',
    [ModelType.NONE]: '旅行者',
    [CommonOption.ALL]: '所有',
  }[modelType] ?? '未定義'
}

function translateRole(role: string) {
  return {
    [Role.MAIN_DPS]: '主C',
    [Role.SUB_DPS]: '副C',
    [Role.SUPPORT]: '輔助',
    [CommonOption.ALL]: '所有',
  }[role] ?? '未定義'
}

function translateWish(wish: string) {
  return {
    [Wish.LIMITED_TIME_EVENT]: '限定',
    [Wish.STANDARD]: '常駐',
    [Wish.NONE]: '旅行者',
    [CommonOption.ALL]: '所有',
  }[wish] ?? '未定義'
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
