// src/features/Analysis/components/composables/useCharacterArchetypeMap.ts

import { computed, onMounted, ref } from 'vue';

import { useAnalysisDomain } from '@/composables/useAnalysisDomain';
import { useCharacterDomain } from '@/composables/useCharacterDomain';
import { useEchartTheme } from '@/composables/useEchartTheme';
import { useDesignTokens } from '@/composables/useDesignTokens';

import type { CallbackDataParams } from 'echarts/types/dist/shared';
import type { ITacticalUsages } from '../../types/ITacticalUsages';

interface IArchetypePoint {
    characterKey: string;
    clusterId: number;
    x: number;
    y: number;
}

export function useCharacterArchetypeMap() {
    const designTokens = useDesignTokens();
    const { gridStyle, xAxisStyle, yAxisStyle, tooltipStyle, dataZoomStyle, legendStyle } = useEchartTheme();
    const analysisDomain = useAnalysisDomain();
    const { fetchArchetypeMap, fetchTacticalUsages } = analysisDomain;
    const characterDomain = useCharacterDomain();
    const { getDisplayName } = characterDomain;

    const clusterColors = [
        '#ff5964',
        '#526dff',
        '#6bf178',
        '#ffe74c',
        '#FF922B',
        '#65def1',
    ];
    const tacticalUsages = ref<ITacticalUsages[] | null>(null);       
    const archetypeMap = ref<IArchetypePoint[] | null>(null);

    const tacticalUsageMap = computed(() =>
        Object.fromEntries(
            (tacticalUsages.value ?? []).map((u) => [u.characterKey, u.tacticalUsage])
        )
    );

    onMounted(async () => {
        tacticalUsages.value = await fetchTacticalUsages();
        archetypeMap.value = await fetchArchetypeMap();
    });

    const option = computed(() => {
        if (!archetypeMap.value || !tacticalUsages.value) return null;

        return {
            tooltip: {
                ...tooltipStyle('single'),
                formatter: (params: CallbackDataParams) => params.name,
            },
            grid: {
                ...gridStyle('tight', true),
                borderWidth: 1,          // 外框線寬
                borderColor: designTokens.colorOnSurface.value,     // 外框顏色
                show: true,
            },
            xAxis: {
                type: "value",
                min: (value: any) => Math.floor(value.min * 0.95),
                max: (value: any) => Math.ceil(value.max * 1.05),
                splitLine: { 
                    show: true, 
                        lineStyle: {
                        color: designTokens.colorSurfaceVariant.value,
                        width: 1,
                    },
                },
                axisLabel: { show: false, }
            },
            yAxis: {
                type: "value",
                min: (value: any) => Math.floor(value.min * 0.95),
                max: (value: any) => Math.ceil(value.max * 1.05),
                splitLine: { 
                    show: true, 
                        lineStyle: {
                        color: designTokens.colorSurfaceVariant.value,
                        width: 1,
                    },
                },
                axisLabel: { show: false, }
            },
            legend: {
                ...legendStyle,
            },
            dataZoom: [
                {
                    ...dataZoomStyle,
                    type: 'inside',
                    yAxisIndex: 0,
                },
                 {
                    ...dataZoomStyle,
                    type: 'inside',
                    xAxisIndex: 0,
                },
            ],
            series: [
                {
                    type: 'scatter',
                    data: archetypeMap.value.map((point: IArchetypePoint) => ({
                        name: getDisplayName(point.characterKey),
                        characterKey: point.characterKey,
                        value: [jitter(point.x), jitter(point.y)],
                        itemStyle: {
                            color: clusterColors[point.clusterId],
                        },
                    })),
                    symbolSize: (value: any, params: any) => {
                        const tacticalUsage = tacticalUsageMap.value[params.data?.characterKey as string]
                        console.log(`tacticalUsage`, params.data?.characterKey)
                        return parseFloat(designTokens.fontSizeSm.value) + tacticalUsage * parseFloat(designTokens.fontSizeMd.value);
                    },
                    label: {
                        show: true,
                        position: 'top', // 可用 'right'、'bottom' 依密度調整
                        distance: 6,
                        formatter: (params: CallbackDataParams) => params.name,
                        color: designTokens.colorOnSurface.value,
                        fontSize: designTokens.fontSizeSm.value,
                        fontWeight: parseFloat(designTokens.fontWeightMedium.value!),
                        backgroundColor: designTokens.colorSurfaceContainerHigh.value,
                        borderRadius: 4,
                        padding: [4, 4],
                        shadowColor: 'rgba(0,0,0,0.2)',
                        shadowBlur: 3,
                        verticalAlign: 'middle',
                    },
                    labelLayout: {
                        hideOverlap: true,
                    },
                },
            ],
        };
    });

    function jitter(v: number, factor = 0.15) {
        return v + (Math.random() - 0.5) * factor;
    }

    return { option };
}
