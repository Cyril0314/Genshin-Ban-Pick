// src/features/Analysis/components/composables/useCharacterArchetypeMap.ts

import { computed, onMounted, ref } from 'vue';

import { useAnalysisDomain } from '@/composables/useAnalysisDomain';
import { useCharacterDomain } from '@/composables/useCharacterDomain';
import { useEchartTheme } from '@/composables/useEchartTheme';
import { useDesignTokens } from '@/composables/useDesignTokens';

import type { CallbackDataParams } from 'echarts/types/dist/shared';
import type { ITacticalUsages } from '../../types/ITacticalUsages';
import type { IArchetypePoint, ICharacterClusters } from '../../types/ICharacterClusters';

export function useCharacterClusters() {
    const designTokens = useDesignTokens();
    const { gridStyle, xAxisStyle, yAxisStyle, tooltipStyle, dataZoomStyle, legendStyle } = useEchartTheme();
    const analysisDomain = useAnalysisDomain();
    const { fetchCharacterClusters, fetchTacticalUsages } = analysisDomain;
    const characterDomain = useCharacterDomain();
    const { getDisplayName } = characterDomain;

    const clusterColors = ['#ff5964', '#526dff', '#6bf178', '#ffe74c', '#FF922B', '#65def1', '#df4be4ff', '#b1e022ff', '#e02248ff'];
    const tacticalUsages = ref<ITacticalUsages[] | null>(null);
    const characterClusters = ref<ICharacterClusters | null>(null);

    const tacticalUsageMap = computed(() => Object.fromEntries((tacticalUsages.value ?? []).map((u) => [u.characterKey, u.tacticalUsage])));
    const archetypePoints = computed(() => characterClusters.value?.archetypePoints);
    const medoidPoints = computed(() => characterClusters.value?.clusterMedoids);
    const bridgeScoreMap = computed(() =>
        Object.fromEntries((characterClusters.value?.bridgeScores ?? []).map((s) => [s.characterKey, s.bridgeScore])),
    );

    onMounted(async () => {
        tacticalUsages.value = await fetchTacticalUsages();
        characterClusters.value = await fetchCharacterClusters();
        console.log(`characterClusters`, characterClusters.value);
    });

    const option = computed(() => {
        if (!archetypePoints.value || !tacticalUsages.value || !medoidPoints.value) return null;
        const topBridges = computed(() => {
            return [...(characterClusters.value?.bridgeScores ?? [])].sort((a, b) => b.bridgeScore - a.bridgeScore).slice(0, 10); // 前 10 個橋接角色
        });
        return {
            tooltip: {
                ...tooltipStyle('single'),
                formatter: (params: CallbackDataParams) => params.name,
            },
            grid: {
                ...gridStyle('tight', true),
                borderWidth: 1, // 外框線寬
                borderColor: designTokens.colorOnSurface.value, // 外框顏色
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
                data: [
                    ...clusterLegendItems.value.map((i) => ({
                        name: i.name,
                        icon: i.icon,
                        itemStyle: i.itemStyle,
                    })),
                    { name: '群中心', icon: 'diamond' },
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
                        name: `群中心-${getDisplayName(m.characterKey)}`,
                        symbol: 'diamond',
                        itemStyle: {
                            color: '#ffffff',
                            borderColor: clusterColors[m.clusterId],
                            borderWidth: 2,
                        },
                        symbolSize: parseFloat(designTokens.fontSizeMd.value) * 2, // 比較大一點
                        label: {
                            show: true,
                            formatter: '中心',
                            color: clusterColors[m.clusterId],
                            fontWeight: 'bold',
                        },
                    })),
                    z: 10, // 在最上層
                },
                {
                    type: 'scatter',
                    data: topBridges.value.map((b) => {
                        const p = archetypePoints.value!.find((x) => x.characterKey === b.characterKey)!;
                        return {
                            name: getDisplayName(p.characterKey),
                            value: [p.x, p.y],
                            itemStyle: {
                                color: '#ffffff',
                                borderWidth: 3,
                                borderColor: clusterColors[p.clusterId],
                                shadowColor: clusterColors[p.clusterId],
                                shadowBlur: 25 + b.bridgeScore * 40,
                            },
                        };
                    }),
                    symbolSize: parseFloat(designTokens.fontSizeMd.value) * 2.2,
                    z: 9,
                },
            ],
        };
    });

    function jitter(v: number, factor = 0.0) {
        return v + (Math.random() - 0.5) * factor;
    }

    const clusterLegendItems = computed(() => {
        if (!archetypePoints.value) return [];

        const maxClusterId = Math.max(...archetypePoints.value.map((p) => p.clusterId));

        return Array.from({ length: maxClusterId + 1 }).map((_, cid) => ({
            name: `群 ${cid}`,
            icon: 'circle',
            itemStyle: { color: clusterColors[cid] },
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
                    .map((p) => ({
                        name: getDisplayName(p.characterKey),
                        characterKey: p.characterKey,
                        value: [jitter(p.x), jitter(p.y)],
                    })),
                itemStyle: { color: clusterColors[cid] },
                symbolSize: (value: any, params: any) => {
                    const tacticalUsage = tacticalUsageMap.value[params.data?.characterKey as string];
                    console.log(`tacticalUsage`, params.data?.characterKey);
                    return parseFloat(designTokens.fontSizeSm.value) + tacticalUsage * parseFloat(designTokens.fontSizeMd.value);
                },
                label: {
                    show: true,
                    position: 'top',
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
                labelLayout: { hideOverlap: true },
            });
        }

        return series;
    });

    return { option };
}
