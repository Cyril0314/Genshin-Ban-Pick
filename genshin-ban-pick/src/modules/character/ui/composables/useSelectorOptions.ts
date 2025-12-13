// src/modules/character/ui/components/composables/useSelectorOptions.ts

import {
    elementTranslator,
    modelTypeTranslator,
    rarityTranslator,
    regionTranslator,
    roleTranslator,
    weaponTranslator,
    wishTranslator,
} from '@/modules/shared/ui/composables/useCharacterTranslators';
import { createTranslator } from '@/modules/shared/domain/createTranslator';
import { sortByEnumOrder} from '@/modules/shared/ui/composables/useCharacterSorter';

import type { ICharacter } from '@shared/contracts/character/ICharacter.ts';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';
import type { EnumOrderValue } from '@/modules/shared/ui/composables/useCharacterSorter';

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
            key: 'weapon',
            label: '選擇武器',
            items: [...uniqueByKey(characters, 'weapon'), CommonOption.All],
            translateFn: (v: string) => translateWeapon(v),
        },
        {
            key: 'element',
            label: '選擇屬性',
            items: [...uniqueByKey(characters, 'element'), CommonOption.All],
            translateFn: (v: string) => translateElement(v),
        },
        {
            key: 'region',
            label: '選擇國家',
            items: [...uniqueByKey(characters, 'region'), CommonOption.All],
            translateFn: (v: string) => translateRegion(v),
        },
        {
            key: 'modelType',
            label: '選擇體型',
            items: [...uniqueByKey(characters, 'modelType'), CommonOption.All],
            translateFn: (v: string) => translateModelType(v),
        },
        {
            key: 'role',
            label: '選擇功能',
            items: [...uniqueByKey(characters, 'role'), CommonOption.All],
            translateFn: (v: string) => translateRole(v),
        },
        {
            key: 'wish',
            label: '選擇祈願',
            items: [...uniqueByKey(characters, 'wish'), CommonOption.All],
            translateFn: (v: string) => translateWish(v),
        },
        {
            key: 'rarity',
            label: '選擇星級',
            items: [...uniqueByKey(characters, 'rarity'), CommonOption.All],
            translateFn: (v: string) => translateRarity(v),
        },
    ];
}

function uniqueByKey<K extends CharacterFilterKey>(data: ICharacter[], key: K,): EnumOrderValue<K>[] {
    const rawValues = Array.from(new Set(data.map((c) => c[key]))) as EnumOrderValue<K>[];
    return sortByEnumOrder(key, rawValues);
}

function translateWeapon(weapon: string) {
    return weaponTranslator(weapon) ?? commonOptionTranslator(weapon) ?? '未定義';
}

function translateElement(element: string) {
    return elementTranslator(element) ?? commonOptionTranslator(element) ?? '未定義';
}

function translateRegion(region: string) {
    return regionTranslator(region) ?? commonOptionTranslator(region) ?? '未定義';
}

function translateRarity(rarity: string) {
    return rarityTranslator(rarity) ?? commonOptionTranslator(rarity) ?? '未定義';
}

function translateModelType(modelType: string) {
    return modelTypeTranslator(modelType) ?? commonOptionTranslator(modelType) ?? '未定義';
}

function translateRole(role: string) {
    return roleTranslator(role) ?? commonOptionTranslator(role) ?? '未定義';
}

function translateWish(wish: string) {
    return wishTranslator(wish) ?? commonOptionTranslator(wish) ?? '未定義';
}

const commonOptionTranslator = createTranslator({
    [CommonOption.All]: '所有',
});
