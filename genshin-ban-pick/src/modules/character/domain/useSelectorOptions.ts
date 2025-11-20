// src/features/CharacterSelector/composables/useSelectorOptions.ts
import { Element, Weapon, Region, ModelType, CharacterRole, Wish, Rarity } from '@/modules/character/types/ICharacter';

import { CharacterFilterKey } from '@/features/BanPick/types/CharacterFilterKey';
import type { ICharacter } from '@/modules/character/types/ICharacter';

export interface SelectorOption {
    key: CharacterFilterKey;
    label: string;
    items: string[];
    translateFn: (val: string) => string;
}

export enum CommonOption {
    All = 'All',
}

export function useSelectorOptions(characterMap: Record<string, ICharacter>): SelectorOption[] {
    const characters = Object.values(characterMap).filter((c) => c.name.toLowerCase() !== 'traveler');

    return [
        {
            key: CharacterFilterKey.Weapon,
            label: '選擇武器',
            items: [...uniqueByKey(characters, CharacterFilterKey.Weapon, weaponOrder), CommonOption.All],
            translateFn: (v: string) => translateWeapon(v),
        },
        {
            key: CharacterFilterKey.Element,
            label: '選擇屬性',
            items: [...uniqueByKey(characters, CharacterFilterKey.Element, elementOrder), CommonOption.All],
            translateFn: (v: string) => translateElement(v),
        },
        {
            key: CharacterFilterKey.Region,
            label: '選擇國家',
            items: [...uniqueByKey(characters, CharacterFilterKey.Region, regionOrder), CommonOption.All],
            translateFn: (v: string) => translateRegion(v),
        },
        {
            key: CharacterFilterKey.ModelType,
            label: '選擇體型',
            items: [...uniqueByKey(characters, CharacterFilterKey.ModelType, modelTypeOrder), CommonOption.All],
            translateFn: (v: string) => translateModelType(v),
        },
        {
            key: CharacterFilterKey.CharacterRole,
            label: '選擇功能',
            items: [...uniqueByKey(characters, CharacterFilterKey.CharacterRole, roleOrder), CommonOption.All],
            translateFn: (v: string) => translateRole(v),
        },
        {
            key: CharacterFilterKey.Wish,
            label: '選擇祈願',
            items: [...uniqueByKey(characters, CharacterFilterKey.Wish, wishOrder), CommonOption.All],
            translateFn: (v: string) => translateWish(v),
        },
        {
            key: CharacterFilterKey.Rarity,
            label: '選擇星級',
            items: [...uniqueByKey(characters, CharacterFilterKey.Rarity, rarityOrder), CommonOption.All],
            translateFn: (v: string) => translateRarity(v),
        },
    ];
}

function uniqueByKey<T, K extends keyof T>(data: T[], key: K, orderArray: T[K][]): T[K][] {
    const uniqueSet = new Set(data.map((item) => item[key]));
    if (orderArray.length === 0) return [...uniqueSet];
    return orderArray.filter((item) => uniqueSet.has(item)); // 一個指定順序的陣列
}

// --- Translate & Order ---

function translateWeapon(weapon: string) {
    return (
        {
            [Weapon.Sword]: '單手劍',
            [Weapon.Claymore]: '雙手劍',
            [Weapon.Polearm]: '長槍',
            [Weapon.Bow]: '弓',
            [Weapon.Catalyst]: '法器',
            [CommonOption.All]: '所有',
        }[weapon] ?? '未定義'
    );
}

function translateElement(element: string) {
    return (
        {
            [Element.Anemo]: '風',
            [Element.Geo]: '岩',
            [Element.Electro]: '雷',
            [Element.Dendro]: '草',
            [Element.Hydro]: '水',
            [Element.Pyro]: '火',
            [Element.Cryo]: '冰',
            [Element.None]: '無屬性',
            [CommonOption.All]: '所有',
        }[element] ?? '未定義'
    );
}

function translateRegion(region: string) {
    return (
        {
            [Region.Mondstadt]: '蒙德',
            [Region.Liyue]: '璃月',
            [Region.Inazuma]: '稻妻',
            [Region.Sumeru]: '須彌',
            [Region.Fontaine]: '楓丹',
            [Region.Natlan]: '納塔',
            [Region.NodKrai]: '挪德卡萊',
            [Region.Snezhnaya]: '至冬',
            [Region.None]: '無所屬',
            [CommonOption.All]: '所有',
        }[region] ?? '未定義'
    );
}

function translateRarity(rarity: string) {
    return (
        {
            [Rarity.FiveStar]: '5★',
            [Rarity.FourStar]: '4★',
            [CommonOption.All]: '所有',
        }[rarity] ?? '未定義'
    );
}

function translateModelType(modelType: string) {
    return (
        {
            [ModelType.TallMale]: '成男',
            [ModelType.TallFemale]: '成女',
            [ModelType.MediumMale]: '少年',
            [ModelType.MediumFemale]: '少女',
            [ModelType.ShortFemale]: '幼女',
            [ModelType.None]: '旅行者',
            [CommonOption.All]: '所有',
        }[modelType] ?? '未定義'
    );
}

function translateRole(role: string) {
    return (
        {
            [CharacterRole.MainDPS]: '主C',
            [CharacterRole.SubDPS]: '副C',
            [CharacterRole.Support]: '輔助',
            [CommonOption.All]: '所有',
        }[role] ?? '未定義'
    );
}

function translateWish(wish: string) {
    return (
        {
            [Wish.Limited]: '限定',
            [Wish.Standard]: '常駐',
            [Wish.None]: '旅行者',
            [CommonOption.All]: '所有',
        }[wish] ?? '未定義'
    );
}

const weaponOrder: Weapon[] = [Weapon.Sword, Weapon.Claymore, Weapon.Polearm, Weapon.Bow, Weapon.Catalyst];

const elementOrder = [Element.Anemo, Element.Geo, Element.Electro, Element.Dendro, Element.Hydro, Element.Pyro, Element.Cryo, Element.None];

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
];

const rarityOrder = [Rarity.FiveStar, Rarity.FourStar];

const modelTypeOrder = [
    ModelType.TallMale,
    ModelType.TallFemale,
    ModelType.MediumMale,
    ModelType.MediumFemale,
    ModelType.ShortFemale,
    ModelType.None,
];

const roleOrder = [CharacterRole.MainDPS, CharacterRole.SubDPS, CharacterRole.Support];
const wishOrder = [Wish.Limited, Wish.Standard, Wish.None];
