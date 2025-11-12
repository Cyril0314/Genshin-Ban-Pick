// src/features/Analysis/components/composables/useCharacterTacticalUsagesChart.ts

import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import tinycolor from 'tinycolor2';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { useAnalysisDomain } from '@/composables/useAnalysisDomain';
import { useCharacterDomain } from '@/composables/useCharacterDomain';
import { useCharacterStore } from '@/stores/characterStore';
import { useDesignTokens } from '@/composables/useDesignTokens';
import { ElementColors } from '@/constants/useElementColor';
import { useEchartTheme } from '@/composables/useEchartTheme';

import type { ITacticalUsages } from '../../types/ITacticalUsages';

export function useCharacterTacticalUsagesChart(topN = 120) {
    const designTokens = useDesignTokens();
    const { gridStyle, xAxisStyle, yAxisStyle, legendStyle, tooltipStyle, dataZoomStyle } = useEchartTheme();
    const analysisDomain = useAnalysisDomain();
    const { fetchTacticalUsages } = analysisDomain;
    const characterDomain = useCharacterDomain();
    const { getDisplayName } = characterDomain;
    const characterStore = useCharacterStore();
    const { characterMap } = storeToRefs(characterStore);

    const data = ref<ITacticalUsages[] | null>(null);

    onMounted(async () => {
        data.value = await fetchTacticalUsages();
    });

    const option = computed(() => {
        if (!data.value || !characterMap.value) return null;
        const sorted = [...data.value].sort((a, b) => b.tacticalUsage - a.tacticalUsage);
        const top = sorted.slice(0, topN);
        return {
            tooltip: {
                ...tooltipStyle('single'),
                formatter: (p: CallbackDataParams) => {
                    const d = top[p.dataIndex];
                    return `
                        <b>${getDisplayName(d.characterKey)}</b><br/>
                        <b>綜合全期平均與有效權重: ${d.tacticalUsage.toFixed(2)}</b><br/>
                        僅計算登場後的有效權重: ${d.effectiveUsage.toFixed(2)}<br/>
                        在全部場次中的平均權重: ${d.globalUsage.toFixed(2)}<br/>
                        <b>登場後參與場數: ${d.validMatchCount}</b><br/>
                        非隨機Pick次數: ${d.context.pick.manualNotUsed + d.context.pick.manualUsed}<br/>
                        隨機Pick次數: ${d.context.pick.randomNotUsed + d.context.pick.randomUsed}<br/>
                        非隨機Ban次數: ${d.context.ban.manual}<br/>
                        隨機Ban次數: ${d.context.ban.random}<br/>
                        非隨機Utility次數: ${d.context.utility.manualNotUsed + d.context.utility.manualUsedOneSide + d.context.utility.manualUsedBothSides}<br/>
                        隨機Utility次數: ${d.context.utility.randomNotUsed + d.context.utility.randomUsedOneSide + d.context.utility.randomUsedBothSides}<br/>
                        Pick被Utility取代次數: ${d.context.pick.randomNotUsed + d.context.pick.manualNotUsed}<br/>
                        Utility取代Pick次數(只有單隊): ${d.context.utility.manualUsedOneSide + d.context.utility.randomUsedOneSide}<br/>
                        Utility取代Pick次數(兩隊同時): ${d.context.utility.manualUsedBothSides + d.context.utility.randomUsedBothSides}
                    `;
                },
            },
            grid: {
                ...gridStyle('tight', true),
            },
            xAxis: {
                ...xAxisStyle(),
                name: '權重',
                type: 'value',
            },
            yAxis: {
                ...yAxisStyle(),
                data: top.map((d) => getDisplayName(d.characterKey)),
                type: 'category',
            },
            legend: {
                ...legendStyle('top'),
                data: [
                    {
                        name: '綜合全期平均與有效權重',
                        icon: 'roundRect',
                        itemStyle: { color: ElementColors['Pyro']!.main },
                    },
                    {
                        name: '僅計算登場後的有效權重',
                        icon: 'roundRect',
                        itemStyle: { color: tinycolor(ElementColors['Pyro']!.light).setAlpha(0.45).toRgbString() },
                    },
                ],
            },
            dataZoom: [
                {
                    ...dataZoomStyle,
                    type: 'inside',
                    start: 0,
                    end: 20,
                    yAxisIndex: 0,
                },
            ],
            series: [
                {
                    name: '綜合全期平均與有效權重',
                    type: 'bar',
                    data: top.map((d) => d.tacticalUsage.toFixed(3)),
                    barWidth: parseFloat(designTokens.borderRadiusMd.value),
                    itemStyle: {
                        color: (params: CallbackDataParams) => {
                            const d = top[params.dataIndex];
                            const characterKey = top[params.dataIndex].characterKey;
                            const element = characterMap.value[characterKey].element;
                            const base = ElementColors[element]?.main ?? '#bdbdbd';
                            // const alpha = Math.min(0.45 + d.tacticalUsage / 1, 1);
                            // return tinycolor(base).setAlpha(alpha).toRgbString();
                            return base;
                        },
                        borderRadius: [0, parseFloat(designTokens.borderRadiusSm.value), parseFloat(designTokens.borderRadiusSm.value), 0],
                    },
                    label: {
                        show: true,
                        position: 'right',
                        color: designTokens.colorOnSurface.value,
                        fontSize: designTokens.fontSizeSm.value,

                        formatter: (p: any) => `${top[p.dataIndex].tacticalUsage.toFixed(2)}`,
                    },
                    z: 1,
                },
                {
                    name: '僅計算登場後的有效權重',
                    type: 'bar',
                    data: top.map((d) => d.effectiveUsage),
                    barWidth: parseFloat(designTokens.borderRadiusLg.value),
                    barGap: '-125%',
                    itemStyle: {
                        color: (params: CallbackDataParams) => {
                            const key = top[params.dataIndex].characterKey;
                            const element = characterMap.value[key].element;
                            const base = ElementColors[element]?.light ?? '#fff';
                            return tinycolor(base).setAlpha(0.45).toRgbString();
                        },
                        borderRadius: [0, parseFloat(designTokens.borderRadiusMd.value), parseFloat(designTokens.borderRadiusMd.value), 0],
                    },
                    label: {
                        show: true,
                        position: 'right',
                        color: designTokens.colorOnSurfaceVariantAlpha.value,
                        fontSize: designTokens.fontSizeSm.value,

                        formatter: (p: any) => `${top[p.dataIndex].effectiveUsage.toFixed(2)}`,
                    },
                    z: 2,
                },
            ],
        };
    });

    return { option, data };
}
