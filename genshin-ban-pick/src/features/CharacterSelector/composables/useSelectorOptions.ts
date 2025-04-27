// src/features/CharacterSelector/composables/useSelectorOptions.ts

import { computed } from 'vue'
import type { CharacterInfo } from '@/types/CharacterInfo'

export type FilterKey = 'weapon' | 'element' | 'region' | 'rarity' | 'model_type' | 'role' | 'wish'

export interface SelectorOption {
  key: FilterKey
  label: string
  items: string[]
  translateFn: (val: string) => string
}

export function useSelectorOptions(characterMap: Record<string, CharacterInfo>) {
  const characters = computed(() => Object.values(characterMap))

  return computed<SelectorOption[]>(() => [
    {
      key: 'weapon',
      label: '選擇武器',
      items: uniqueByKey(characters.value, 'weapon', weaponOrder),
      translateFn: translateWeapon,
    },
    {
      key: 'element',
      label: '選擇屬性',
      items: uniqueByKey(characters.value, 'element', elementOrder),
      translateFn: translateElement,
    },
    {
      key: 'region',
      label: '選擇國家',
      items: uniqueByKey(characters.value, 'region', regionOrder),
      translateFn: translateRegion,
    },
    {
      key: 'model_type',
      label: '選擇體型',
      items: uniqueByKey(characters.value, 'model_type', modelTypeOrder),
      translateFn: translateModelType,
    },
    {
      key: 'role',
      label: '選擇功能',
      items: uniqueByKey(characters.value, 'role', roleOrder),
      translateFn: translateRole,
    },
    {
      key: 'wish',
      label: '選擇祈願',
      items: uniqueByKey(characters.value, 'wish', wishOrder),
      translateFn: translateWish,
    },
    {
      key: 'rarity',
      label: '選擇星級',
      items: uniqueByKey(characters.value, 'rarity', rarityOrder),
      translateFn: translateRarity,
    },
  ])
}

function uniqueByKey<T>(data: T[], key: keyof T, orderArray: string[] = []): string[] {
  const uniqueSet = new Set(data.map((item) => item[key] as string))
  if (orderArray.length === 0) return [...uniqueSet].sort()
  return orderArray.filter((item) => uniqueSet.has(item))
}

// --- Translate & Order ---

function translateWeapon(weapon: string) {
  return (
    {
      Sword: '單手劍',
      Claymore: '雙手劍',
      Polearm: '長槍',
      Bow: '弓',
      Catalyst: '法器',
    }[weapon] ?? weapon
  )
}

function translateElement(elelment: string) {
  return (
    {
      Anemo: '風',
      Geo: '岩',
      Electro: '雷',
      Dendro: '草',
      Hydro: '水',
      Pyro: '火',
      Cryo: '冰',
      None: '無屬性',
    }[elelment] ?? elelment
  )
}

function translateRegion(region: string) {
  return (
    {
      Mondstadt: '蒙德',
      Liyue: '璃月',
      Inazuma: '稻妻',
      Sumeru: '須彌',
      Fontaine: '楓丹',
      Natlan: '納塔',
      Snezhnaya: '至冬',
      None: '無所屬',
    }[region] ?? region
  )
}

function translateRarity(rarity: string) {
  return (
    {
      '5 Stars': '5★',
      '4 Stars': '4★',
    }[rarity] ?? rarity
  )
}

function translateModelType(modelType: string) {
  return (
    {
      'Tall Male': '成男',
      'Tall Female': '成女',
      'Medium Male': '少年',
      'Medium Female': '少女',
      'Short Female': '幼女',
      None: '旅行者',
    }[modelType] ?? modelType
  )
}

function translateRole(role: string) {
  return (
    {
      'Main DPS': '主C',
      'Sub DPS': '副C',
      Support: '輔助',
    }[role] ?? role
  )
}

function translateWish(wish: string) {
  return (
    {
      'Limited-Time Event Wish': '限定',
      'Standard Wish': '常駐',
      None: '旅行者',
    }[wish] ?? wish
  )
}

const weaponOrder = ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst']
const elementOrder = ['Anemo', 'Geo', 'Electro', 'Dendro', 'Hydro', 'Pyro', 'Cryo', 'None']
const regionOrder = [
  'Mondstadt',
  'Liyue',
  'Inazuma',
  'Sumeru',
  'Fontaine',
  'Natlan',
  'Snezhnaya',
  'None',
]
const rarityOrder = ['5 Stars', '4 Stars']
const modelTypeOrder = [
  'Tall Male',
  'Tall Female',
  'Medium Male',
  'Medium Female',
  'Short Female',
  'None',
]
const roleOrder = ['Main DPS', 'Sub DPS', 'Support']
const wishOrder = ['Limited-Time Event Wish', 'Standard Wish', 'None']
