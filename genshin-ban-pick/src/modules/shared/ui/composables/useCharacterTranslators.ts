// src/modules/shared/ui/composables/useCharacterTranslators.ts

import { Rarity, Element, Weapon, ModelType, CharacterRole, Region, Wish } from '@shared/contracts/character/value-types';
import { createTranslator } from '../../domain/createTranslator';

export const weaponTranslator = createTranslator({
    [Weapon.Sword]: '單手劍',
    [Weapon.Claymore]: '雙手劍',
    [Weapon.Polearm]: '長槍',
    [Weapon.Bow]: '弓',
    [Weapon.Catalyst]: '法器',
});

export const elementTranslator = createTranslator({
    [Element.Anemo]: '風',
    [Element.Geo]: '岩',
    [Element.Electro]: '雷',
    [Element.Dendro]: '草',
    [Element.Hydro]: '水',
    [Element.Pyro]: '火',
    [Element.Cryo]: '冰',
    [Element.None]: '無屬性',
});

export const regionTranslator = createTranslator({
    [Region.Mondstadt]: '蒙德',
    [Region.Liyue]: '璃月',
    [Region.Inazuma]: '稻妻',
    [Region.Sumeru]: '須彌',
    [Region.Fontaine]: '楓丹',
    [Region.Natlan]: '納塔',
    [Region.NodKrai]: '挪德卡萊',
    [Region.Snezhnaya]: '至冬',
    [Region.None]: '無所屬',
});

export const rarityTranslator = createTranslator({
    [Rarity.FiveStar]: '5★',
    [Rarity.FourStar]: '4★',
});

export const modelTypeTranslator = createTranslator({
    [ModelType.TallMale]: '成男',
    [ModelType.TallFemale]: '成女',
    [ModelType.MediumMale]: '少年',
    [ModelType.MediumFemale]: '少女',
    [ModelType.ShortFemale]: '幼女',
    [ModelType.None]: '旅行者',
});

export const roleTranslator = createTranslator({
    [CharacterRole.MainDPS]: '主C',
    [CharacterRole.SubDPS]: '副C',
    [CharacterRole.Support]: '輔助',
});

export const wishTranslator = createTranslator({
    [Wish.Limited]: '限定',
    [Wish.Standard]: '常駐',
    [Wish.None]: '旅行者',
});
