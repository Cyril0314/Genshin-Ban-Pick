// src/modules/analysis/ui/composables/buildLayeredCharacterChartOption.ts
//
// 角色屬性分布頁的單一大圖：依使用者選的屬性順序（1-6 層，內→外）逐層分桶，最外固定是
// 角色。同一份樹資料可畫成旭日圖（sunburst）或矩形樹圖（treemap）。
// 共用原子 ATTRIBUTES / getPieColor 來自 buildPlayerStyleOption（屬性配置單一來源）。

import tinycolor from 'tinycolor2';

import { sortByEnumOrder } from '@/modules/shared/ui/composables/useCharacterSorter';
import { ATTRIBUTES, getPieColor } from './buildPlayerStyleOption';

import type { ICharacter } from '@shared/contracts/character/ICharacter';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';
import type { EnumOrderValue } from '@/modules/shared/ui/composables/useCharacterSorter';

// 層選單（chip picker）與 key→translator 快查
export const ATTRIBUTE_LAYER_OPTIONS: { key: CharacterFilterKey; label: string }[] = ATTRIBUTES.map(({ key, label }) => ({ key, label }));

const TRANSLATORS = Object.fromEntries(ATTRIBUTES.map((a) => [a.key, a.translator])) as Record<CharacterFilterKey, (key: string) => string>;

const LAYER_LIGHTEN_STEP = 6; // 每往外一層提亮的幅度

// echarts 5 內建預設色盤。無專屬色的分類用它當基底，才能在保有「往外提亮、內外對得到」
// 的前提下，呈現與 echarts 自動配色一致的觀感（不能放手讓 echarts 配，否則外層無法提亮）。
const ECHARTS_DEFAULT_PALETTE = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];

interface ILayeredChartColors {
    label: string | undefined; // 分類文字色
    border: string | undefined; // 切片間隔線（用 cell 底色融入）
}

interface ICharacterUsageItem {
    key: string;
    character: ICharacter;
    count: number;
}

// key: CharacterFilterKey 是聯集，但 getPieColor / sortByEnumOrder 是泛型，這兩個薄包裝
// 把 string 分類值收斂進對應的 enum 值型別（沿用 toPieSorted 既有的 as 轉法）。
function categoryColor<K extends CharacterFilterKey>(key: K, category: string): string | undefined {
    return getPieColor(key, category as EnumOrderValue<K>);
}

function sortCategories<K extends CharacterFilterKey>(key: K, categories: string[]): string[] {
    return sortByEnumOrder(key, categories as EnumOrderValue<K>[]) as string[];
}

// 依「已選屬性順序」遞迴分桶，最外圈固定是角色。每條分支的色相由最內層（depth 0）的分類決定
// （元素/稀有用專屬色，其餘取 echarts 預設盤），往外每層提亮一階 → 同色系、由深到淺、內外對得到。
function buildLayerNodes(
    items: ICharacterUsageItem[],
    layerKeys: CharacterFilterKey[],
    depth: number,
    branchBase: string,
    getCharacterName: (key: string) => string,
): unknown[] {
    if (depth >= layerKeys.length) {
        // 最外圈：角色（依次數遞減），只靠 tooltip
        const color = tinycolor(branchBase).lighten(depth * LAYER_LIGHTEN_STEP).toHexString();
        return items
            .slice()
            .sort((a, b) => b.count - a.count)
            .map((it) => ({ name: getCharacterName(it.key), value: it.count, itemStyle: { color } }));
    }

    const key = layerKeys[depth];
    const groups: Record<string, ICharacterUsageItem[]> = {};
    for (const it of items) {
        const category = String(it.character[key]);
        (groups[category] ??= []).push(it);
    }

    return sortCategories(key, Object.keys(groups)).map((category, index) => {
        // 最內層才決定色相；更外層沿用整條分支的基底色，只是逐層提亮
        const base = depth === 0 ? categoryColor(key, category) ?? ECHARTS_DEFAULT_PALETTE[index % ECHARTS_DEFAULT_PALETTE.length] : branchBase;
        const color = tinycolor(base).lighten(depth * LAYER_LIGHTEN_STEP).toHexString();
        return {
            name: TRANSLATORS[key](category),
            itemStyle: { color },
            // treemap 不會用父節點 itemStyle.color 塗 band；用 upperLabel.backgroundColor 逐節點上色。
            // sunburst 會忽略 upperLabel，故共用同一份 data 無副作用。
            upperLabel: { backgroundColor: color },
            children: buildLayerNodes(groups[category], layerKeys, depth + 1, base, getCharacterName),
        };
    });
}

export type LayeredChartType = 'sunburst' | 'treemap';

// 兩種圖共用同一個 series id + universalTransition → 切換時圖元互相 morph（扇形 ↔ 矩形）。
const LAYERED_CHART_ID = 'layered-character';
const MORPH_DURATION = 1200;

// 旭日圖：環狀，屬性層沿切線顯示分類標籤、最外角色圈只靠 tooltip，點圈下鑽。
function buildSunburstSeries(data: unknown[], layerKeys: CharacterFilterKey[], colors: ILayeredChartColors) {
    return {
        type: 'sunburst' as const,
        id: LAYERED_CHART_ID,
        universalTransition: true,
        animationDurationUpdate: MORPH_DURATION,
        radius: ['0%', '95%'],
        center: ['50%', '50%'],
        data,
        // 維持輸入順序：屬性層 enum 序、角色層次數遞減；預設的 'desc' 會打亂
        sort: null,
        // 點節點 → 下鑽成新的根（zoom in），點環心回上層
        nodeClick: 'rootToNode',
        itemStyle: { borderColor: colors.border, borderWidth: 1 },
        emphasis: { focus: 'ancestor' },
        // 每個屬性層顯示分類標籤（沿切線）
        levels: layerKeys.map(() => ({ label: { rotate: 'tangential' as const, minAngle: 6 } })),
    };
}

// 矩形樹圖：巢狀矩形，屬性層名稱顯示在區塊頂部 band、角色顯示在格內，點區塊放大、麵包屑回上層。
function buildTreemapSeries(data: unknown[], layerKeys: CharacterFilterKey[], colors: ILayeredChartColors) {
    return {
        type: 'treemap' as const,
        id: LAYERED_CHART_ID,
        universalTransition: true,
        animationDurationUpdate: MORPH_DURATION,
        data,
        width: '95%',
        height: '95%',
        roam: false,
        nodeClick: 'zoomToNode',
        breadcrumb: { show: true, bottom: 0 },
        upperLabel: { show: layerKeys.length > 0 },
        label: { show: true, color: colors.label },
        itemStyle: { borderColor: colors.border, borderWidth: 1, gapWidth: 1 },
    };
}

// 單一大圖：依使用者選的屬性順序（1-6 層，內→外）逐層分桶，最外固定是角色；
// 同一份樹資料可畫成旭日圖或矩形樹圖（由 chartType 決定 series）。
export function buildLayeredCharacterChartOption(
    characterCounts: Record<string, number>,
    characterMap: Record<string, ICharacter>,
    layerKeys: CharacterFilterKey[],
    getCharacterName: (key: string) => string,
    colors: ILayeredChartColors,
    tooltip: object,
    chartType: LayeredChartType,
) {
    const items: ICharacterUsageItem[] = Object.entries(characterCounts)
        .map(([key, count]) => ({ key, character: characterMap[key], count }))
        .filter((it) => it.character);

    const data = buildLayerNodes(items, layerKeys, 0, '#888888', getCharacterName);
    const total = items.reduce((sum, it) => sum + it.count, 0); // 百分比分母 fallback = 全部出場次數

    const series = chartType === 'treemap' ? buildTreemapSeries(data, layerKeys, colors) : buildSunburstSeries(data, layerKeys, colors);

    return {
        tooltip: {
            ...tooltip,
            // 佔上一層百分比：treePathInfo 是 root→當前的路徑，父節點 = 倒數第二個。
            // 最上層的父為 root（其 value = 總數），故最上層等於佔總數。取不到時退回 total。
            formatter: (p: { name: string; value: number; treePathInfo?: { value: number }[] }) => {
                const path = p.treePathInfo;
                const parentValue = path && path.length >= 2 ? path[path.length - 2].value : total;
                return parentValue > 0 ? `${p.name}: ${p.value} (${((p.value / parentValue) * 100).toFixed(1)}%)` : `${p.name}: ${p.value}`;
            },
        },
        series: [series],
    };
}
