// src/modules/analysis/ui/composables/useCharacterPickPriorityChart.ts

import { computed, onMounted, ref } from 'vue';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useCharacterStore } from '@/modules/character';
import { storeToRefs } from 'pinia';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import type { ICharacterPickPriority } from '@shared/contracts/analysis/ICharacterPickPriority';

export function useCharacterPickPriorityChart() {
    const analysisUseCase = useAnalysisUseCase();
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();
    const designTokens = useDesignTokens();
    const { gridStyle, valueAxisStyle, categoryAxisStyle, tooltipStyle, dataZoomStyle } = useEchartTheme();

    const characterStore = useCharacterStore();
    const { characterMap } = storeToRefs(characterStore);

    const data = ref<ICharacterPickPriority[]>();

    onMounted(async () => {
        data.value = await analysisUseCase.fetchCharacterUsagePickPriority();
    });

    const option = computed(() => {
        if (!data.value || !characterMap.value) return undefined;

        const sorted = [...data.value].sort((a, b) => b.pickPriority - a.pickPriority);

        return {
            tooltip: {
                ...tooltipStyle('single'),
                formatter: (p: CallbackDataParams) => {
                    const d = sorted[p.dataIndex];
                    return `
                        <b>${getCharacterDisplayName(d.characterKey)}</b><br/>
                        <b>平均相對順位: ${(d.pickPriority * 100).toFixed(1)}%</b><br/>
                        <span style="font-size: 1em; color: #888">
                        (100% = 第一手必搶, 0% = 最後才選)<br/>
                        </span>
                        平均絕對順位 (Index): ${d.averageIndex.toFixed(2)}<br/>
                        採樣場次 (Picks): ${d.pickCount}
                    `;
                },
            },
            grid: {
                ...gridStyle('tight', true),
                left: '2%', // Give more space for labels if needed
            },
            xAxis: {
                ...valueAxisStyle(),
                name: '優先級',
                min: 0,
                max: 1,
            },
            yAxis: {
                ...categoryAxisStyle(),
                data: sorted.map((d) => getCharacterDisplayName(d.characterKey)),
            },
            dataZoom: [
                {
                    ...dataZoomStyle,
                    type: 'inside', // Mouse wheel
                    yAxisIndex: 0,
                    start: 80,
                    end: 100,
                },
            ],
            series: [
                {
                    name: '搶角優先度',
                    type: 'bar',
                    // Calculate "Urgency Score" = 1 - Priority.
                    // Priority 0.0 (First) -> Score 1.0
                    // Priority 1.0 (Last) -> Score 0.0
                    data: sorted.map((d) => (1 - d.pickPriority).toFixed(3)),
                    itemStyle: {
                        color: (params: CallbackDataParams) => {
                            const d = sorted[params.dataIndex];
                            const element = characterMap.value[d.characterKey]?.element;
                            const base = elementColors[element]?.main ?? '#bdbdbd';
                            return base;
                        },
                        borderRadius: [0, parseFloat(designTokens.radiusSm.value!), parseFloat(designTokens.radiusSm.value!), 0],
                    },
                    label: {
                        show: true,
                        position: 'right',
                        color: designTokens.colorOnSurface.value,
                        fontSize: designTokens.fontSizeSm.value,
                        formatter: (p: any) => {
                            const d = sorted[p.dataIndex];
                            return `${((1 - d.pickPriority) * 100).toFixed(0)}%`;
                        },
                    },
                },
            ],
        };
    });

    return { option, data };
}
