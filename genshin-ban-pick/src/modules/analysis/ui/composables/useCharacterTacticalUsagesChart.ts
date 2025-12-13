// src/modules/analysis/ui/composables/useCharacterTacticalUsagesChart.ts

import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import tinycolor from 'tinycolor2';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { useCharacterStore } from '@/modules/character';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';

import type { ICharacterTacticalUsage } from '@shared/contracts/analysis/ICharacterTacticalUsage';

export function useCharacterTacticalUsagesChart(topN = 120) {
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();
    const designTokens = useDesignTokens();
    const { gridStyle, xAxisStyle, yAxisStyle, legendStyle, tooltipStyle, dataZoomStyle } = useEchartTheme();
    const analysisUseCase = useAnalysisUseCase();
    const characterStore = useCharacterStore();
    const { characterMap } = storeToRefs(characterStore);

    const data = ref<ICharacterTacticalUsage[] | null>(null);

    onMounted(async () => {
        data.value = await analysisUseCase.fetchTacticalUsages();
    });

    const option = computed(() => {
        if (!data.value || !characterMap.value) return null;
        const sorted = [...data.value].sort((a, b) => b.effectiveUsage - a.effectiveUsage);
        const top = sorted.slice(0, topN);
        return {
            tooltip: {
                ...tooltipStyle('single'),
                formatter: (p: CallbackDataParams) => {
                    const d = top[p.dataIndex];
                    return `
                        <b>${getCharacterDisplayName(d.characterKey)}</b><br/>
                        <b>僅計算登場後的有效權重: ${d.effectiveUsage.toFixed(2)}</b><br/>
                        在全部場次中的平均權重: ${d.globalUsage.toFixed(2)}<br/>
                        綜合全期平均與有效權重: ${d.tacticalUsage.toFixed(2)}<br/>
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
                data: top.map((d) => getCharacterDisplayName(d.characterKey)),
                type: 'category',
            },
            legend: {
                ...legendStyle('top'),
                itemWidth: parseFloat(designTokens.baseSize.value) * 10,
                itemHeight: parseFloat(designTokens.baseSize.value) * 4,
                data: [
                    {
                        name: '僅計算登場後的有效權重',
                        icon: 'roundRect',
                        itemStyle: { color: tinycolor(elementColors['Pyro']!.main).darken(10).toRgbString() },
                    },
                    {
                        name: '綜合全期平均與有效權重',
                        icon: 'roundRect',
                        itemStyle: { color: tinycolor(elementColors['Pyro']!.main).brighten(10).toRgbString() },
                    },
                ],
            },
            dataZoom: [
                {
                    ...dataZoomStyle,
                    type: 'inside',
                    start: 0,
                    end: 15,
                    yAxisIndex: 0,
                },
            ],
            series: [
                {
                    name: '僅計算登場後的有效權重',
                    type: 'bar',
                    data: top.map((d) => d.effectiveUsage),
                    // barWidth: parseFloat(designTokens.baseSize.value!) * 8,
                    // barCategoryGap: '30%',
                    
                    itemStyle: {
                        color: (params: CallbackDataParams) => {
                            const key = top[params.dataIndex].characterKey;
                            const element = characterMap.value[key].element;
                            const base = elementColors[element]?.main ?? '#fff';
                            return tinycolor(base).darken(10).toRgbString();
                        },
                        borderRadius: [0, parseFloat(designTokens.radiusSm.value!), parseFloat(designTokens.radiusSm.value!), 0],
                        
                    },
                    label: {
                        show: true,
                        position: 'right',
                        color: designTokens.colorOnSurface.value,
                        fontSize: designTokens.fontSizeSm.value,

                        formatter: (p: any) => `${top[p.dataIndex].effectiveUsage.toFixed(2)}`,
                    },
                    z: 1,
                },
                {
                    name: '綜合全期平均與有效權重',
                    type: 'bar',
                    data: top.map((d) => d.tacticalUsage.toFixed(3)),
                    // barWidth: parseFloat(designTokens.baseSize.value!) * 12,
                    barCategoryGap: '40%',
                    barGap: '-100%',
                    itemStyle: {
                        color: (params: CallbackDataParams) => {
                            const d = top[params.dataIndex];
                            const characterKey = top[params.dataIndex].characterKey;
                            const element = characterMap.value[characterKey].element;
                            const base = elementColors[element]?.main ?? '#bdbdbd';
                            // const alpha = Math.min(0.45 + d.tacticalUsage / 1, 1);
                            return tinycolor(base).brighten(10).toRgbString();
                        },
                        borderRadius: [0, parseFloat(designTokens.radiusMd.value!), parseFloat(designTokens.radiusMd.value!), 0],
                    },
                    label: {
                        show: true,
                        position: 'right',
                        color: designTokens.colorOnSurface.value,
                        fontSize: designTokens.fontSizeSm.value,

                        formatter: (p: any) => `${top[p.dataIndex].tacticalUsage.toFixed(2)}`,
                    },
                    z: 2,
                },
            ],
        };
    });

    return { option, data };
}
