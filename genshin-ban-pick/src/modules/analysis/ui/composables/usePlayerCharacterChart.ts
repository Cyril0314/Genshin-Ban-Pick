// src/modules/analysis/ui/composables/usePlayerCharacterChart.ts

import { computed, onMounted, ref } from 'vue';

import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import type { KeyIndexedMatrix } from '@shared/contracts/analysis/KeyIndexedMatrix';

export function usePlayerCharacterChart() {
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();
    const designTokens = useDesignTokens();
    const { gridStyle, tooltipStyle, dataZoomStyle } = useEchartTheme();
    const analysisUseCase = useAnalysisUseCase();

    const matrix = ref<KeyIndexedMatrix<string, string> | null>(null);

    onMounted(async () => {
        matrix.value = await analysisUseCase.fetchPlayerCharacterUsage();
    });

    const option = computed(() => {
        if (!matrix.value) return null;

        const top = buildHeatmapData(matrix.value);

        return {
            tooltip: {
                ...tooltipStyle('single'),
                position: 'top',
                formatter: (params: { value: [number, number, number] }) => {
                    const [x, y, count] = params.value;
                    const characterKey = top.xAxis[x];
                    const player = top.yAxis[y];
                    if (count === 0) return '無明顯使用';
                    return `${player} 使用 ${getCharacterDisplayName(characterKey)}：${count} 次`;
                },
            },
            grid: {
                ...gridStyle('tight', true),
                top: 0,
            },
            visualMap: {
                min: 0,
                max: Math.max(...top.data.map((d) => d[2])),
                calculable: true,
                orient: 'vertical',
                right: 0,
                top: 'center',
                textStyle: {
                    color: designTokens.colorOnSurfaceVariant.value,
                },
                inRange: {
                    color: ['#DAEDFF', '#91CEFF', '#3890F9', '#1A5CDB', '#1C428C'],
                },
            },
            xAxis: {
                type: 'category',
                data: top.xAxis.map((chracterKey) => getCharacterDisplayName(chracterKey)),
                axisLabel: {
                    rotate: 60,
                    color: designTokens.colorOnSurface.value,
                },
            },
            yAxis: {
                type: 'category',
                data: top.yAxis,
                axisLabel: {
                    color: designTokens.colorOnSurface.value,
                },
            },
            dataZoom: [
                {
                    ...dataZoomStyle,
                    type: 'inside',
                    start: 0,
                    end: 100,
                    yAxisIndex: 0,
                },
                {
                    ...dataZoomStyle,
                    type: 'inside',
                    start: 0,
                    end: 50,
                    xAxisIndex: 0,
                },
            ],
            series: [
                {
                    type: 'heatmap',
                    data: top.data,
                    emphasis: {
                        itemStyle: {
                            borderColor: designTokens.colorOutlineVariant.value,
                            borderWidth: 1,
                        },
                    },
                },
            ],
        };
    });

    function buildHeatmapData(preference: KeyIndexedMatrix<string, string>, topN = 100) {
        // 1) 找出全角色使用總次數
        const characterCountMap: Record<string, number> = {};
        const playerCountMap: Record<string, number> = {};

        for (const [player, characterMap] of Object.entries(preference)) {
            for (const [characterKey, count] of Object.entries(characterMap)) {
                characterCountMap[characterKey] = (characterCountMap[characterKey] || 0) + (count ?? 0);
                playerCountMap[player] = (playerCountMap[player] || 0) + (count ?? 0);
            }
        }

        console.log(`preference`, preference)

        const topCharacters = Object.entries(characterCountMap)
            .sort((a, b) => b[1] - a[1])
            // .slice(0, topN)
            .map(([k]) => k);

        const topPlayers = Object.entries(playerCountMap)
            .sort((a, b) => b[1] - a[1])
            .map(([k]) => k);

        console.log(`topCharacters`, topCharacters);
        console.log(`topPlayers`, topPlayers);

        const characterIndices = Object.fromEntries(topCharacters.map((c, i) => [c, i]));
        const playerIndices = Object.fromEntries(topPlayers.map((p, i) => [p, i]));

        console.log(`characterIndices`, characterIndices);
        console.log(`playerIndices`, playerIndices);

        const matrix = Array(topPlayers.length)
            .fill(null)
            .map(() => Array(topCharacters.length).fill(0));

        for (const player of topPlayers) {
            const playerIndex = playerIndices[player];
            if (playerIndex === undefined) {
                console.error('playerIndex undefined:', player, playerIndices);
                continue;
            }
            for (const characterKey of topCharacters) {
                const characterIndex = characterIndices[characterKey];

                if (characterIndex === undefined) {
                    console.error('characterIndex undefined:', characterKey, characterIndices);
                    continue;
                }

                const count = preference[player][characterKey] ?? 0;
                matrix[playerIndex][characterIndex] = count;
            }
        }

        const data: [number, number, number][] = [];
        for (let y = 0; y < topPlayers.length; y++) {
            for (let x = 0; x < topCharacters.length; x++) {
                data.push([x, y, matrix[y][x]]);
            }
        }

        return {
            xAxis: topCharacters,
            yAxis: topPlayers,
            data,
        };
    }

    return { option };
}
