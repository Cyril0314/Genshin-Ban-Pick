// src/features/Analysis/components/composables/useCharacterSynergy.ts

import { computed, onMounted, ref, watch } from 'vue';

import { useAnalysisDomain } from '@/composables/useAnalysisDomain';
import { useCharacterDomain } from '@/composables/useCharacterDomain';
import { useDesignTokens } from '@/composables/useDesignTokens';
import { useEchartTheme } from '@/composables/useEchartTheme';

export function useCharacterSynergy() {
    const designTokens = useDesignTokens();
    const { gridStyle, tooltipStyle, dataZoomStyle } = useEchartTheme();
    const analysisDomain = useAnalysisDomain();
    const { fetchSynergy } = analysisDomain;
    const characterDomain = useCharacterDomain();
    const { getDisplayName } = characterDomain;

    const scope = ref<'match' | 'team' | 'setup'>('setup');
    const synergy = ref<Record<string, Record<string, number>> | null>(null);

    onMounted(async () => {
        synergy.value = await fetchSynergy({'mode': scope.value});
    });

    watch(scope, async () => {
        synergy.value = await fetchSynergy({'mode': scope.value});
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
                    let scopeTitle: string
                    switch (scope.value) {
                        case 'match':
                            scopeTitle = '同場'
                            break
                        case 'team':
                            scopeTitle = '同組'
                            break
                        case 'setup':
                            scopeTitle = '同隊'
                            break
                    }
                    return `${getDisplayName(chars[x])} + ${getDisplayName(chars[y])}<br/>${scopeTitle}使用：${count} 次`;
                },
            },
            grid: {
                ...gridStyle('tight', true),
                top: 0,
            },
            xAxis: { 
                type: 'category', 
                data: chars.map((char) => getDisplayName(char)),
                axisLabel: { 
                    rotate: 60,
                    color: designTokens.colorOnSurface.value,
                },
            },
            yAxis: {
                type: 'category', 
                data: chars.map((char) => getDisplayName(char)),
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
                inRange: { color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'] },
            },
            series: [
                {
                    type: 'heatmap',
                    data: matrix,
                    emphasis: { 
                        itemStyle: { 
                            borderColor: designTokens.colorOutlineVariant.value,
                            borderWidth: 1
                        } 
                    },
                },
            ],
        };
    });

    return { scope, option };
}
