// src/modules/analysis/ui/composables/useCharacterSynergyGraphChart.ts

import { computed, onMounted, ref, watch } from 'vue';

import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';

import type { ICharacterGraphLink } from '@shared/contracts/analysis/character/ICharacterGraphLink';

export function useCharacterSynergyGraphChart() {
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();
    const designTokens = useDesignTokens();
    const { gridStyle, tooltipStyle, dataZoomStyle } = useEchartTheme();
    const analysisUseCase = useAnalysisUseCase();

    const graph = ref<{ nodes: string[]; links: ICharacterGraphLink[] } | null>(null);

    onMounted(async () => {
        graph.value = await analysisUseCase.fetchCharacterSynergyGraph();
        console.log('graph links', graph.value?.links)
    });

    const option = computed(() => {
        if (!graph.value) return null;
        return {
            tooltip: {
                ...tooltipStyle('single'),
                position: 'top',
            },
            grid: {
                ...gridStyle('tight', true),
                top: 0,
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
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    roam: true,
                    data: graph.value.nodes.map((node) => { return { id: node, name: getCharacterDisplayName(node) } }),
                    links: graph.value.links,
                    force: {
                        repulsion: 2000,
                        edgeLength: 80,
                    },
                },
            ],
        };
    });

    return { option };
}
