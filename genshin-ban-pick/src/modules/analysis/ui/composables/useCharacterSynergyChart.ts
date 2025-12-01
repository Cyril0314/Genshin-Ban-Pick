// src/modules/analysis/ui/composables/useCharacterSynergyChart.ts

import { computed, onMounted, ref, watch } from 'vue';

import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { getCharacterDisplayName } from '@/modules/shared/domain/getCharacterDisplayName';
import { useAnalysisUseCase } from './useAnalysisUseCase';

import type { SynergyMode } from '@shared/contracts/analysis/value-types';

export function useCharacterSynergyChart() {
    const designTokens = useDesignTokens();
    const { gridStyle, tooltipStyle, dataZoomStyle } = useEchartTheme();
    const analysisUseCase = useAnalysisUseCase();

    const scope = ref<SynergyMode>('setup');
    const synergy = ref<Record<string, Record<string, number>> | null>(null);

    onMounted(async () => {
        synergy.value = await analysisUseCase.fetchSynergy({ mode: scope.value });
    });

    watch(scope, async () => {
        synergy.value = await analysisUseCase.fetchSynergy({ mode: scope.value });
    });

    const option = computed(() => {
        if (!synergy.value) return null;
        const chars = Object.keys(synergy.value).sort();
        const matrix: [number, number, number][] = [];
        for (let i = 0; i < chars.length; i++) {
            for (let j = 0; j < chars.length; j++) {
                matrix.push([i, j, synergy.value[chars[i]]?.[chars[j]] ?? 0]);
            }
        }
        return {
            tooltip: {
                ...tooltipStyle('single'),
                position: 'top',
                formatter: (params: { value: [number, number, number] }) => {
                    const [x, y, count] = params.value;
                    if (count === 0) return '無明顯搭配';
                    let scopeTitle: string;
                    switch (scope.value) {
                        case 'match':
                            scopeTitle = '同場';
                            break;
                        case 'team':
                            scopeTitle = '同組';
                            break;
                        case 'setup':
                            scopeTitle = '同隊';
                            break;
                    }
                    return `${getCharacterDisplayName(chars[x])} + ${getCharacterDisplayName(chars[y])}<br/>${scopeTitle}使用：${count} 次`;
                },
            },
            grid: {
                ...gridStyle('tight', true),
                top: 0,
            },
            xAxis: {
                type: 'category',
                data: chars.map((char) => getCharacterDisplayName(char)),
                axisLabel: {
                    rotate: 60,
                    color: designTokens.colorOnSurface.value,
                },
            },
            yAxis: {
                type: 'category',
                data: chars.map((char) => getCharacterDisplayName(char)),
                axisLabel: {
                    color: designTokens.colorOnSurface.value,
                },
            },
            dataZoom: [
                {
                    ...dataZoomStyle,
                    type: 'inside',
                    start: 0,
                    end: 25,
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
            visualMap: {
                min: 0,
                max: Math.max(...matrix.map((d) => d[2])),
                calculable: true,
                orient: 'vertical',
                right: 0,
                top: 'center',
                inRange: {
                    color: [
                        '#FBEDCA',
                        '#F2C255',
                        '#E88C18',
                        '#AA4913',
                        '#723015',
                    ],
                },
            },
            series: [
                {
                    type: 'heatmap',
                    data: matrix,
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

    return { scope, option };
}
