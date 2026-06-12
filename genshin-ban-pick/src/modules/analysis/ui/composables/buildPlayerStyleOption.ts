// src/modules/analysis/ui/composables/buildPlayerStyleOption.ts
//
// PlayerStyle echarts option 的單一來源。共用原子（雷達 config/series、屬性
// pie data）拼出三種輸出：
//   - buildStyleRadarOption   ：只有雷達、放大置中
//   - buildAttributeDonutOptions：六個屬性各一張小 donuts

import { sortByEnumOrder } from '@/modules/shared/ui/composables/useCharacterSorter';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';
import { rarityColors } from '@/modules/shared/ui/constants/rarityColors';
import {
    elementTranslator,
    modelTypeTranslator,
    regionTranslator,
    roleTranslator,
    weaponTranslator,
    rarityTranslator,
} from '@/modules/shared/ui/composables/useCharacterTranslators';

import type { IPlayerStyle } from '@shared/contracts/analysis/IPlayerStyle';
import type { ICharacterAttributeDistributions } from '@shared/contracts/analysis/character/ICharacterAttributeDistributions';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';
import type { EnumOrderValue } from '@/modules/shared/ui/composables/useCharacterSorter';

interface IStyleColors {
    onSurface: string | undefined;
    onSurfaceVariant: string | undefined;
    primary: string | undefined;
}

interface IStyleOptionParams extends IStyleColors {
    profile?: IPlayerStyle;
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
    if (key === 'rarity') {
        return rarityColors[name as keyof typeof rarityColors];
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

function buildRadarSeries(profile: IPlayerStyle, primary: string | undefined) {
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

export function buildStyleRadarOption(profile: IPlayerStyle, colors: IStyleColors, tooltip: object) {
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

// sliceLabels：大圖（有空間）顯示切片標籤 + 輔助線；小圈（player-profile）關掉、改用環心主類別
export function buildAttributeDonutOptions(
    d: ICharacterAttributeDistributions,
    labelColor: string | undefined,
    tooltip: object,
    options: { sliceLabels?: boolean } = {},
): IAttributeDonut[] {
    const { sliceLabels = false } = options;
    return ATTRIBUTES.map((attr) => {
        const data = toPieSorted(attr.key, attr.pick(d), attr.translator);
        const dominant = data.reduce<(typeof data)[number] | undefined>((top, slice) => (!top || slice.value > top.value ? slice : top), undefined);
        return {
            key: attr.key,
            label: attr.label,
            option: {
                tooltip,
                // 緊湊模式（無切片標籤）才在環心顯示主類別；有切片標籤時就重複了
                title: sliceLabels
                    ? undefined
                    : {
                          text: dominant?.name ?? '',
                          left: 'center',
                          top: 'center',
                          textStyle: { color: labelColor, fontSize: 12, fontWeight: 'normal' },
                      },
                series: [
                    {
                        type: 'pie' as const,
                        // 有外側標籤時縮小環體留出標籤空間
                        radius: sliceLabels ? ['45%', '72%'] : ['58%', '82%'],
                        center: ['50%', '50%'],
                        data,
                        label: sliceLabels ? { color: labelColor } : { show: false },
                        labelLine: { show: sliceLabels },
                    },
                ],
            },
        };
    });
}
