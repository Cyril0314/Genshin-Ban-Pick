// src/modules/analysis/ui/composables/usePlayerCharacterChart.ts

import { computed, onMounted, ref } from 'vue';

import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { createLogger } from '@/app/utils/logger';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';

import { getTeamMemberName } from '@shared/contracts/team/TeamMember';

import type { CallbackDataParams } from 'echarts/types/dist/shared';
import type { IPlayerCharacterUsage } from '@shared/contracts/analysis/IPlayerCharacterUsage';

const logger = createLogger('analysis.ui.playerCharacterChart');

export function usePlayerCharacterChart() {
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();
    const designTokens = useDesignTokens();
    const { gridStyle, tooltipStyle, dataZoomStyle } = useEchartTheme();
    const analysisUseCase = useAnalysisUseCase();

    const usages = ref<IPlayerCharacterUsage[]>();

    onMounted(async () => {
        usages.value = await analysisUseCase.fetchPlayerCharacterUsage();
    });

    const option = computed(() => {
        if (!usages.value) return undefined;

        const top = buildHeatmapData(usages.value);

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

    function buildHeatmapData(usages: IPlayerCharacterUsage[]) {
        // 1) 角色按全體使用總次數排序（X 軸）
        const characterTotals: Record<string, number> = {};
        for (const usage of usages) {
            for (const [characterKey, count] of Object.entries(usage.characterCounts)) {
                characterTotals[characterKey] = (characterTotals[characterKey] ?? 0) + count;
            }
        }
        const topCharacters = Object.entries(characterTotals)
            .sort((a, b) => b[1] - a[1])
            .map(([characterKey]) => characterKey);

        // 2) 玩家按各自使用總次數排序（Y 軸）。以 identity key 為列，同名玩家各自獨立一列。
        const sortedPlayers = [...usages].sort((a, b) => playerTotal(b) - playerTotal(a));

        const characterIndex = Object.fromEntries(topCharacters.map((characterKey, i) => [characterKey, i]));

        const data: [number, number, number][] = [];
        sortedPlayers.forEach((usage, y) => {
            for (const [characterKey, count] of Object.entries(usage.characterCounts)) {
                const x = characterIndex[characterKey];
                if (x === undefined) {
                    logger.error('characterIndex undefined:', characterKey);
                    continue;
                }
                data.push([x, y, count]);
            }
        });

        return {
            xAxis: topCharacters,
            yAxis: sortedPlayers.map((usage) => getTeamMemberName(usage.teamMember)),
            data,
        };
    }

    function playerTotal(usage: IPlayerCharacterUsage): number {
        return Object.values(usage.characterCounts).reduce((sum, count) => sum + count, 0);
    }

    return { option };
}
