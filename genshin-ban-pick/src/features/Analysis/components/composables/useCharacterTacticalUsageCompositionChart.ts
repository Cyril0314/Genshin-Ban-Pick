// src/features/Analysis/components/composables/useCharacterTacticalUsageCompositionChart.ts

import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import tinycolor from 'tinycolor2';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { useAnalysisDomain } from '@/composables/useAnalysisDomain';
import { useCharacterDomain } from '@/modules/character/domain/useCharacterDomain';
import { useCharacterStore } from '@/modules/character/store/characterStore';
import { useDesignTokens } from '@/composables/useDesignTokens';
import { useEchartTheme } from '@/composables/useEchartTheme';

import type { ITacticalUsages } from '../../types/ITacticalUsages';
import { ZoneType } from '@/modules/board/types/IZone';

export function useCharacterTacticalUsageCompositionChart(topN = 120) {
    const designTokens = useDesignTokens();
    const { gridStyle, xAxisStyle, yAxisStyle, legendStyle, tooltipStyle, dataZoomStyle } = useEchartTheme();
    const analysisDomain = useAnalysisDomain();
    const { fetchTacticalUsages } = analysisDomain;
    const characterDomain = useCharacterDomain();
    const { getDisplayName } = characterDomain;
    const characterStore = useCharacterStore();
    const { characterMap } = storeToRefs(characterStore);

    const isPercentage = ref(false);
    const activeType = ref<'All' | ZoneType>('All');

    const data = ref<ITacticalUsages[] | null>(null);

    onMounted(async () => {
        data.value = await fetchTacticalUsages();
    });

    const option = computed(() => {
        if (!data.value || !characterMap.value) return null;
        const sorted = [...data.value].sort((a, b) => b.effectiveUsage - a.effectiveUsage);
        const top = sorted.slice(0, topN);
        return {
            tooltip: {
                ...tooltipStyle('axis'),
                formatter: (params: CallbackDataParams[]) => {
                    const lines = params.map((param: CallbackDataParams) => {
                        const v = param.value;
                        if (!v) return '';
                        return `<span style="color:${param.color};">●</span> ${param.seriesName}: ${v}`;
                    });
                    const name = getDisplayName(top[params[0].dataIndex].characterKey);
                    return `<b>${name}</b><br/>${lines.join('<br/>')}`;
                },
            },
            grid: {
                ...gridStyle('tight', true),
            },
            xAxis: {
                ...xAxisStyle(),
                name: isPercentage.value ? '%' : '次數',
                type: 'value',
                axisLabel: {
                    color: '#999',
                    formatter: (v: number) => (isPercentage.value ? `${(v * 100).toFixed(0)}%` : v.toFixed(0)),
                },
            },
            yAxis: {
                ...yAxisStyle(),
                data: top.map((d) => getDisplayName(d.characterKey)),
                type: 'category',
            },
            legend: {
                ...legendStyle('top'),
                itemWidth: parseFloat(designTokens.baseSize.value) * 10,
                itemHeight: parseFloat(designTokens.baseSize.value) * 4,
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
            series: makeActiveSeries(top, activeType.value),
        };
    });

    function getTotal(data: ITacticalUsages, activeType: ZoneType | 'All') {
        switch (activeType) {
            case ZoneType.Ban:
                return data.context.ban.total;
            case ZoneType.Pick:
                return data.context.pick.total;
            case ZoneType.Utility:
                return data.context.utility.total;
            case 'All':
                return data.context.ban.total + data.context.pick.total + data.context.utility.total;
        }
    }

    function normalize(val: number, total: number) {
        return isPercentage.value && total > 0 ? val / total : val;
    }

    function makeSeries(label: string, color: string, data: number[]) {
        return {
            name: label,
            type: 'bar',
            stack: 'usage',
            barCategoryGap: '40%',
            data: data,
            itemStyle: { color },
        };
    }

    function makeActiveSeries(top: ITacticalUsages[], activeType: ZoneType | 'All') {
        switch (activeType) {
            case ZoneType.Ban:
                return [
                    makeSeries(
                        '非隨機Ban',
                        '#FF6B4A',
                        top.map((d) => normalize(d.context.ban.manual, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        '隨機Ban',
                        '#FFA891',
                        top.map((d) => normalize(d.context.ban.random, getTotal(d, activeType))),
                    ),
                ];

            case ZoneType.Pick:
                return [
                    makeSeries(
                        '非隨機Pick使用',
                        '#F4D38C',
                        top.map((d) => normalize(d.context.pick.manualUsed, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        '隨機Pick使用',
                        '#FFE9A9',
                        top.map((d) => normalize(d.context.pick.randomUsed, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        '非隨機Pick未使用',
                        '#E1D6BA',
                        top.map((d) => normalize(d.context.pick.manualNotUsed, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        '隨機Pick未使用',
                        '#F0E7D5',
                        top.map((d) => normalize(d.context.pick.randomNotUsed, getTotal(d, activeType))),
                    ),
                ];

            case ZoneType.Utility:
                return [
                    makeSeries(
                        '非隨機Utility單隊使用',
                        '#5A78FF',
                        top.map((d) => normalize(d.context.utility.manualUsedOneSide, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        '隨機Utility單隊使用',
                        '#A9B9FF',
                        top.map((d) => normalize(d.context.utility.randomUsedOneSide, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        '非隨機Utility兩隊使用',
                        '#243AFF',
                        top.map((d) => normalize(d.context.utility.manualUsedBothSides, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        '隨機Utility兩隊使用',
                        '#6E83FF',
                        top.map((d) => normalize(d.context.utility.randomUsedBothSides, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        '非隨機Utility未使用',
                        '#CBD3F9',
                        top.map((d) => normalize(d.context.utility.manualNotUsed, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        '隨機Utility未使用',
                        '#E1E6FA',
                        top.map((d) => normalize(d.context.utility.randomNotUsed, getTotal(d, activeType))),
                    ),
                ];

            case 'All':
                return [
                    // 🟨 Pick
                    makeSeries(
                        '非隨機Pick使用',
                        '#F4D38C',
                        top.map((d) => normalize(d.context.pick.manualUsed, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        '隨機Pick使用',
                        '#FFE9A9',
                        top.map((d) => normalize(d.context.pick.randomUsed, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        'Pick未使用',
                        '#E1D6BA',
                        top.map((d) => normalize(d.context.pick.manualNotUsed + d.context.pick.randomNotUsed, getTotal(d, activeType))),
                    ),

                    // 🟥 Ban
                    makeSeries(
                        '非隨機Ban',
                        '#FF6B4A',
                        top.map((d) => normalize(d.context.ban.manual, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        '隨機Ban',
                        '#FFA891',
                        top.map((d) => normalize(d.context.ban.random, getTotal(d, activeType))),
                    ),

                    // 🟦 Utility
                    makeSeries(
                        'Utility單隊使用',
                        '#5A78FF',
                        top.map((d) => normalize(d.context.utility.manualUsedOneSide + d.context.utility.randomUsedOneSide, getTotal(d, activeType))),
                    ),
                    makeSeries(
                        'Utility兩隊使用',
                        '#243AFF',
                        top.map((d) =>
                            normalize(d.context.utility.manualUsedBothSides + d.context.utility.randomUsedBothSides, getTotal(d, activeType)),
                        ),
                    ),
                    makeSeries(
                        'Utility未使用',
                        '#CBD3F9',
                        top.map((d) => normalize(d.context.utility.manualNotUsed + d.context.utility.randomNotUsed, getTotal(d, activeType))),
                    ),
                ];
        }
    }

    return { isPercentage, activeType, option, data };
}
