// src/features/Analysis/components/composables/useCharacterArchetypeMap.ts

import { computed, onMounted, ref } from 'vue';

import { useAnalysisDomain } from '@/composables/useAnalysisDomain';
import { useCharacterDomain } from '@/composables/useCharacterDomain';

interface ArchetypePoint {
    characterKey: string;
    clusterId: number;
    x: number;
    y: number;
}

export function useCharacterArchetypeMap() {
    const analysisDomain = useAnalysisDomain();
    const { fetchArchetypeMap } = analysisDomain;
    const characterDomain = useCharacterDomain();
    const { getDisplayName } = characterDomain;

    const clusterColors = ['#ff6b6b', '#4dabf7', '#51cf66', '#ffd43b'];

    const archetypeMap = ref<ArchetypePoint[] | null>(null);

    onMounted(async () => {
        archetypeMap.value = await fetchArchetypeMap();
    });

    const option = computed(() => {
        if (!archetypeMap.value) return null;
        return {
            tooltip: {
                formatter: (d: any) => d.name,
            },
            xAxis: { show: false },
            yAxis: { show: false },
            legend: {},
            series: [
                {
                    type: 'scatter',
                    symbolSize: 18,
                    data: archetypeMap.value.map((p: ArchetypePoint) => ({
                        name: getDisplayName(p.characterKey),
                        value: [p.x, p.y],
                        itemStyle: { color: clusterColors[p.clusterId] },
                    })),
                    label: {
                        show: true,
                        formatter: (params: any) => params.name,
                        color: '#fff',
                        fontSize: 12,
                    },
                },
            ],
        };
    });

    return { option };
}
