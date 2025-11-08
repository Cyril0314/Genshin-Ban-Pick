// src/features/Analysis/components/composables/useCharacterSynergy.ts

import { computed, onMounted, ref } from 'vue';

import { useAnalysisDomain } from '@/composables/useAnalysisDomain';
import { useCharacterDomain } from '@/composables/useCharacterDomain';

export function useCharacterSynergy() {
    const analysisDomain = useAnalysisDomain();
    const { fetchSynergy } = analysisDomain;
    const characterDomain = useCharacterDomain();
    const { getDisplayName } = characterDomain;

    const synergy = ref<Record<string, Record<string, number>> | null>(null);

    onMounted(async () => {
        synergy.value = await fetchSynergy();
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
                position: 'top',
                formatter: (params: { value: [number, number, number] }) => {
                    const [x, y, count] = params.value;
                    if (count === 0) return '無明顯搭配';
                    return `${getDisplayName(chars[x])} + ${getDisplayName(chars[y])}<br/>同場使用：${count} 次`;
                },
            },
            grid: { height: '100%', top: '5%' },
            xAxis: { type: 'category', data: chars.map((char) => getDisplayName(char)), axisLabel: { rotate: 60 } },
            yAxis: { type: 'category', data: chars.map((char) => getDisplayName(char)) },
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
                    emphasis: { itemStyle: { borderColor: '#333', borderWidth: 1 } },
                },
            ],
        };
    });

    return { option };
}
