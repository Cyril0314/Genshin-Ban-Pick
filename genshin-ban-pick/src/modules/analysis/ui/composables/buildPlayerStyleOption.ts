// src/modules/analysis/ui/composables/buildPlayerStyleOption.ts
//
// PlayerStyle echarts option 的單一來源。共用原子（雷達 config/series、屬性
// pie data）拼出三種輸出：
//   - buildPlayerStyleOption  ：雷達 + 六 pie 擠同一 canvas（dashboard widget 用）
//   - buildStyleRadarOption   ：只有雷達、放大置中（profile 頁 hero 用）
//   - buildAttributeDonutOptions：六個屬性各一張小 donut（profile 頁格狀用）

import { sortByEnumOrder } from '@/modules/shared/ui/composables/useCharacterSorter';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';
import {
    elementTranslator,
    modelTypeTranslator,
    regionTranslator,
    roleTranslator,
    weaponTranslator,
    rarityTranslator,
} from '@/modules/shared/ui/composables/useCharacterTranslators';

import type { IPlayerStyleProfile } from '@shared/contracts/analysis/IPlayerStyleProfile';
import type { ICharacterAttributeDistributions } from '@shared/contracts/analysis/character/ICharacterAttributeDistributions';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';
import type { EnumOrderValue } from '@/modules/shared/ui/composables/useCharacterSorter';

interface IStyleColors {
    onSurface: string | undefined;
    onSurfaceVariant: string | undefined;
    primary: string | undefined;
}

interface IStyleOptionParams extends IStyleColors {
    profile?: IPlayerStyleProfile;
    distributions?: ICharacterAttributeDistributions;
    tooltip: object;
}

// ---- 屬性配置（單一來源；dashboard 合併版與頁面 donut 格共用） ----

const ATTRIBUTES: { key: CharacterFilterKey; label: string; pick: (d: ICharacterAttributeDistributions) => Record<string, number>; translator: (key: string) => string }[] = [
    { key: 'element', label: '元素', pick: (d) => d.elementDistribution, translator: elementTranslator },
    { key: 'weapon', label: '武器', pick: (d) => d.weaponDistribution, translator: weaponTranslator },
    { key: 'modelType', label: '體型', pick: (d) => d.modelTypeDistribution, translator: modelTypeTranslator },
    { key: 'role', label: '定位', pick: (d) => d.roleDistribution, translator: roleTranslator },
    { key: 'region', label: '地區', pick: (d) => d.regionDistribution, translator: regionTranslator },
    { key: 'rarity', label: '稀有', pick: (d) => d.rarityDistribution, translator: rarityTranslator },
];

// 合併版六 pie 在單一 canvas 的固定位置（順序對齊 ATTRIBUTES）
const PIE_CENTERS: [string, string][] = [
    ['60%', '15%'],
    ['85%', '15%'],
    ['60%', '50%'],
    ['85%', '50%'],
    ['60%', '85%'],
    ['85%', '85%'],
];

const RADAR_INDICATORS = [
    { name: '角色多樣性', max: 100 },
    { name: 'Meta', max: 100 },
    { name: '元素多樣性', max: 100 },
    { name: '定位多樣性', max: 100 },
    { name: '武器多樣性', max: 100 },
    { name: '體型多樣性', max: 100 },
    { name: '地區多樣性', max: 100 },
    { name: '稀有度多樣性', max: 100 },
];

// ---- 原子 ----

function getPieColor<K extends CharacterFilterKey>(key: K, name: EnumOrderValue<K>) {
    if (key === 'element') {
        const elementName = name as keyof typeof elementColors;
        return elementColors[elementName]?.main ?? '#999999';
    }
    return undefined;
}

function toPieSorted<K extends CharacterFilterKey>(key: K, obj: Record<string, number>, translator: (key: string) => string) {
    const keys = Object.keys(obj) as EnumOrderValue<K>[];
    return sortByEnumOrder(key, keys).map((name) => ({
        name: translator(name),
        value: obj[name],
        itemStyle: { color: getPieColor(key, name) },
    }));
}

function buildRadarConfig(colors: IStyleColors, center: [string, string], radius: string) {
    return {
        indicator: RADAR_INDICATORS,
        center,
        radius,
        splitNumber: 4,
        axisName: { color: colors.onSurface },
        splitLine: { lineStyle: { color: colors.onSurfaceVariant } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: colors.onSurfaceVariant } },
    };
}

function buildRadarSeries(profile: IPlayerStyleProfile, primary: string | undefined) {
    return {
        type: 'radar' as const,
        data: [
            {
                value: [
                    profile.versatility,
                    profile.metaAffinity,
                    profile.elementAdjustedDiversity,
                    profile.roleAdjustedDiversity,
                    profile.weaponAdjustedDiversity,
                    profile.modelTypeAdjustedDiversity,
                    profile.regionAdjustedDiversity,
                    profile.rarityAdjustedDiversity,
                ].map((v) => Number(v.toFixed(2))),
                name: '玩家風格',
                itemStyle: { color: primary },
                areaStyle: { color: primary, opacity: 0.2 },
                emphasis: { disabled: true },
            },
        ],
    };
}

function buildAttributePieSeries(d: ICharacterAttributeDistributions, labelColor: string | undefined) {
    return ATTRIBUTES.map((attr, i) => ({
        type: 'pie' as const,
        radius: ['20%', '30%'],
        center: PIE_CENTERS[i],
        data: toPieSorted(attr.key, attr.pick(d), attr.translator),
        label: { color: labelColor },
    }));
}

// ---- 合併版（dashboard widget）：雷達 + 六 pie 同 canvas ----

export function buildPlayerStyleOption(params: IStyleOptionParams) {
    const { profile, distributions, tooltip, ...colors } = params;
    if (!profile && !distributions) return undefined;

    const pies = distributions ? buildAttributePieSeries(distributions, colors.onSurface) : [];

    if (!profile) {
        return { tooltip, series: pies }; // 全體 scope：只有 pie
    }

    return {
        tooltip,
        radar: buildRadarConfig(colors, ['25%', '40%'], '40%'),
        series: [buildRadarSeries(profile, colors.primary), ...pies],
    };
}

// ---- 分離版（profile 頁）----

export function buildStyleRadarOption(profile: IPlayerStyleProfile, colors: IStyleColors, tooltip: object) {
    return {
        tooltip,
        radar: buildRadarConfig(colors, ['50%', '55%'], '68%'),
        series: [buildRadarSeries(profile, colors.primary)],
    };
}

export interface IAttributeDonut {
    key: CharacterFilterKey;
    label?: string;
    option: Record<string, unknown>;
}

export function buildAttributeDonutOptions(d: ICharacterAttributeDistributions, labelColor: string | undefined, tooltip: object): IAttributeDonut[] {
    return ATTRIBUTES.map((attr) => ({
        key: attr.key,
        // label: attr.label,
        option: {
            tooltip,
            series: [
                {
                    type: 'pie' as const,
                    radius: ['45%', '72%'],
                    center: ['50%', '50%'],
                    data: toPieSorted(attr.key, attr.pick(d), attr.translator),
                    label: { color: labelColor },
                },
            ],
        },
    }));
}
