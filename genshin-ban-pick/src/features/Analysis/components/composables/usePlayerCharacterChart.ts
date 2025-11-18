// src/features/Analysis/components/composables/usePlayerCharacterChart.ts

import { computed, onMounted, ref } from 'vue';

import { useAnalysisDomain } from '@/composables/useAnalysisDomain';
import { useCharacterDomain } from '@/composables/useCharacterDomain';
import { useEchartTheme } from '@/composables/useEchartTheme';
import { useDesignTokens } from '@/composables/useDesignTokens';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

interface IPreference {
    player: string;
    characters: {
        characterKey: string;
        count: number;
    }[];
}

export function usePlayerCharacterChart() {
    const designTokens = useDesignTokens();
    const { gridStyle, tooltipStyle, dataZoomStyle } = useEchartTheme();
    const analysisDomain = useAnalysisDomain();
    const { fetchPreference } = analysisDomain;
    const characterDomain = useCharacterDomain();
    const { getDisplayName } = characterDomain;

    const preference = ref<IPreference[] | null>(null);

    onMounted(async () => {
        preference.value = await fetchPreference();
    });

    const option = computed(() => {
        if (!preference.value) return null;

        const top = buildHeatmapData(preference.value);

        return {
            tooltip: {
                ...tooltipStyle('single'),
                position: 'top',
                formatter: (params: { value: [number, number, number] }) => {
                    const [x, y, count] = params.value;
                    const characterKey = top.xAxis[x];
                    const player = top.yAxis[y];
                    if (count === 0) return '無明顯使用';
                    return `${player} 使用 ${getDisplayName(characterKey)}：${count} 次`;
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
                data: top.xAxis.map((chracterKey) => getDisplayName(chracterKey)),
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

    function buildHeatmapData(preference: IPreference[], topN = 100) {
        // 1) 找出全角色使用總次數
        const globalCount: Record<string, number> = {};
        for (const data of preference) {
            for (const character of data.characters) {
                globalCount[character.characterKey] = (globalCount[character.characterKey] || 0) + character.count;
            }
        }

        // 2) 找出最熱門角色 (Top N)
        const topCharacters = Object.entries(globalCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN)
            .map(([k]) => k);

        // 3) 整理玩家列表
        const players = preference.map((data) => data.player);

        // 4) 建立 role → index / player → index
        const roleIndex = Object.fromEntries(topCharacters.map((c, i) => [c, i]));
        const playerIndex = Object.fromEntries(players.map((p, i) => [p, i]));

        // 5) 初始化完整矩陣 → 全部設 0
        const matrix = Array(players.length)
            .fill(null)
            .map(() => Array(topCharacters.length).fill(0));

        // 6) 把有使用紀錄的覆蓋進去
        for (const p of preference) {
            for (const c of p.characters) {
                if (roleIndex[c.characterKey] !== undefined) {
                    const x = roleIndex[c.characterKey];
                    const y = playerIndex[p.player];
                    matrix[y][x] = c.count;
                }
            }
        }

        // 7) 轉成 ECharts 格式
        const data = [];
        for (let y = 0; y < players.length; y++) {
            for (let x = 0; x < topCharacters.length; x++) {
                data.push([x, y, matrix[y][x]]);
            }
        }

        return {
            xAxis: topCharacters,
            yAxis: players,
            data,
        };
    }

    return { option };
}
