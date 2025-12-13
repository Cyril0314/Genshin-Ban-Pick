// src/modules/analysis/ui/composables/useCharacterClustersChart.ts

import { computed, onMounted, ref } from 'vue';

import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { chartColors } from '@/modules/shared/ui/constants/chartColors';

import type { CallbackDataParams } from 'echarts/types/dist/shared';
import type { ICharacterClusters } from '@shared/contracts/analysis/ICharacterClusters';
import type { ICharacterTacticalUsage } from '@shared/contracts/analysis/ICharacterTacticalUsage';

export function useCharacterClustersChart() {
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();
    const designTokens = useDesignTokens();
    const { gridStyle, xAxisStyle, yAxisStyle, tooltipStyle, dataZoomStyle, legendStyle } = useEchartTheme();
    const analysisUseCase = useAnalysisUseCase();
    const tacticalUsages = ref<ICharacterTacticalUsage[] | null>(null);
    const characterClusters = ref<ICharacterClusters | null>(null);

    const effectiveUsageMap = computed(() => Object.fromEntries((tacticalUsages.value ?? []).map((u) => [u.characterKey, u.effectiveUsage])));
    const archetypePoints = computed(() => characterClusters.value?.archetypePoints);
    const medoidPoints = computed(() => characterClusters.value?.clusterMedoids);
    const topBridges = computed(() => {
        return [...(characterClusters.value?.bridgeScores ?? [])].sort((a, b) => b.bridgeScore - a.bridgeScore).slice(0, 5);
    });

    onMounted(async () => {
        tacticalUsages.value = await analysisUseCase.fetchTacticalUsages();
        characterClusters.value = await analysisUseCase.fetchCharacterClusters();
        console.log(`characterClusters`, characterClusters.value);
    });

    const option = computed(() => {
        if (!archetypePoints.value || !tacticalUsages.value || !medoidPoints.value || !topBridges.value) return null;
        return {
            tooltip: {
                ...tooltipStyle('single'),
                formatter: (params: CallbackDataParams) => params.name,
            },
            grid: {
                ...gridStyle('tight', true),
                borderWidth: 1, // 外框線寬
                borderColor: designTokens.colorOnSurface.value, // 外框顏色
                top: parseFloat(designTokens.baseSize.value) * 30,
                show: true,
            },
            xAxis: {
                type: 'value',
                min: (value: any) => Math.floor(value.min * 0.95),
                max: (value: any) => Math.ceil(value.max * 1.05),
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: designTokens.colorSurfaceVariant.value,
                        width: 1,
                    },
                },
                axisLabel: { show: false },
            },
            yAxis: {
                type: 'value',
                min: (value: any) => Math.floor(value.min * 0.95),
                max: (value: any) => Math.ceil(value.max * 1.05),
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: designTokens.colorSurfaceVariant.value,
                        width: 1,
                    },
                },
                axisLabel: { show: false },
            },
            legend: {
                ...legendStyle('top'),
                itemHeight: parseFloat(designTokens.baseSize.value) * 12,
                data: [
                    ...clusterLegendItems.value.map((i) => ({
                        name: i.name,
                        icon: i.icon,
                        itemStyle: i.itemStyle,
                    })),
                    {
                        name: '群中心',
                        icon: 'pin',
                        itemStyle: {
                            // itemHeight: parseFloat(designTokens.baseSize.value) * 10,
                            color: designTokens.colorSurfaceContainerHighest.value,
                            borderColor: designTokens.colorOnSurface.value,
                            borderWidth: 1,
                        },
                    },
                ],
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
                ...clusterSeries.value,
                {
                    name: '群中心',
                    type: 'scatter',
                    data: medoidPoints.value.map((m) => ({
                        value: [m.x, m.y],
                        name: `群中心-${getCharacterDisplayName(m.characterKey)}`,
                        symbol: 'pin',
                        itemStyle: {
                            color: designTokens.colorSurfaceContainerHighest.value,
                            borderColor: chartColors[m.clusterId],
                            borderWidth: 2,
                            position: 'top',
                            distance: 10,
                        },
                        symbolSize: parseFloat(designTokens.fontSizeMd.value) * 4,
                        label: {
                            show: false,
                            // formatter: '中心',
                            color: chartColors[m.clusterId],
                            fontWeight: 'bold',
                        },
                    })),
                    z: 10,
                },
            ],
        };
    });

    function jitter(v: number, factor = 0.05) {
        return v + (Math.random() - 0.5) * factor;
    }

    const clusterLegendItems = computed(() => {
        if (!archetypePoints.value) return [];

        const maxClusterId = Math.max(...archetypePoints.value.map((p) => p.clusterId));

        return Array.from({ length: maxClusterId + 1 }).map((_, cid) => ({
            name: `群 ${cid}`,
            icon: 'circle',
            itemStyle: { color: chartColors[cid] },
        }));
    });

    const clusterSeries = computed(() => {
        if (!archetypePoints.value) return [];

        const series: any[] = [];

        const maxClusterId = Math.max(...archetypePoints.value.map((p) => p.clusterId));

        for (let cid = 0; cid <= maxClusterId; cid++) {
            series.push({
                name: `群 ${cid}`,
                type: 'scatter',
                data: archetypePoints.value
                    .filter((p) => p.clusterId === cid)
                    .map((p) => {
                        const isBridgeCharacter = topBridges.value.find((topBridge) => topBridge.characterKey === p.characterKey) !== undefined;
                        return {
                            name: getCharacterDisplayName(p.characterKey),
                            characterKey: p.characterKey,
                            isBridgeCharacter,
                            value: [jitter(p.x), jitter(p.y)],
                            itemStyle: {
                                borderWidth: 3,
                                borderColor: isBridgeCharacter ? '#ffffff' : chartColors[cid],
                            },
                        };
                    }),
                itemStyle: {
                    color: chartColors[cid],
                },
                symbolSize: (value: any, params: any) => {
                    const effectiveUsage = effectiveUsageMap.value[params.data?.characterKey as string];
                    return parseFloat(designTokens.fontSizeSm.value) + effectiveUsage * parseFloat(designTokens.fontSizeMd.value);
                },
                label: {
                    show: true,
                    position: 'left',
                    distance: 0,
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
                labelLayout: { hideOverlap: true },
            });
        }

        return series;
    });

    return { option };
}
