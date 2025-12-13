import { Weapon, Element, Region, Rarity, ModelType, CharacterRole, Wish } from '@shared/contracts/character/value-types';

import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';

export const ENUM_ORDER: Record<CharacterFilterKey, readonly string[]> = {
    weapon: [Weapon.Sword, Weapon.Claymore, Weapon.Polearm, Weapon.Bow, Weapon.Catalyst],

    element: [Element.Anemo, Element.Geo, Element.Electro, Element.Dendro, Element.Hydro, Element.Pyro, Element.Cryo, Element.None],

    region: [
        Region.Mondstadt,
        Region.Liyue,
        Region.Inazuma,
        Region.Sumeru,
        Region.Fontaine,
        Region.Natlan,
        Region.NodKrai,
        Region.Snezhnaya,
        Region.None,
    ],

    rarity: [Rarity.FiveStar, Rarity.FourStar],

    modelType: [ModelType.TallMale, ModelType.TallFemale, ModelType.MediumMale, ModelType.MediumFemale, ModelType.ShortFemale, ModelType.None],

    role: [CharacterRole.MainDPS, CharacterRole.SubDPS, CharacterRole.Support],

    wish: [Wish.Limited, Wish.Standard, Wish.None],
} as const; // ENUM_ORDER 被鎖定為 literal type

type EnumOrderMap = typeof ENUM_ORDER; // 自動推導排序群組的 type map
export type EnumOrderValue<K extends CharacterFilterKey> = EnumOrderMap[K][number]; // 取某個 key 對應的值型別, EnumOrderMap[K] → 屬於某個 filter key 的陣列, EnumOrderMap[K][number] → 該陣列的成員型別

// 如果 key 是 "weapon"，list 必須是 Weapon enum 的 union
// 如果 key 是 "region"，list 必須是 Region union
export function sortByEnumOrder<K extends CharacterFilterKey>(key: K, list: EnumOrderValue<K>[]): EnumOrderValue<K>[] {
    const order = ENUM_ORDER[key] ?? [];
    if (order.length === 0) return [...list];

    // 排序：根據 order array 的 index
    return [...list].sort((a, b) => {
        return order.indexOf(a) - order.indexOf(b);
    });
}
