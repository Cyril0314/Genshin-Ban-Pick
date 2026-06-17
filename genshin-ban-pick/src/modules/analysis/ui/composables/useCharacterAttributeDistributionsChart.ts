// src/modules/analysis/ui/composables/useCharacterAttributeDistributionsChart.ts

import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useCharacterStore } from '@/modules/character';
import { createLogger } from '@/app/utils/logger';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { ATTRIBUTE_LAYER_OPTIONS, buildLayeredCharacterChartOption } from './buildLayeredCharacterChartOption';
import { useAnalysisUseCase } from './useAnalysisUseCase';

import type { LayeredChartType } from './buildLayeredCharacterChartOption';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';

const logger = createLogger('analysis.ui.characterAttributeDistributionsChart');

export function useCharacterAttributeDistributionsChart() {
    const { tooltipStyle } = useEchartTheme();
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();
    const designTokens = useDesignTokens();
    const analysisUseCase = useAnalysisUseCase();
    const { characterMap } = storeToRefs(useCharacterStore());

    const characterCounts = ref<Record<string, number>>();
    // 由內到外的屬性層順序（1-6 層），最外圈固定是角色。預設先看「元素 → 角色」。
    const selectedLayers = ref<CharacterFilterKey[]>(['element']);
    const chartType = ref<LayeredChartType>('sunburst');

    onMounted(async () => {
        try {
            characterCounts.value = await analysisUseCase.fetchCharacterUsageCounts();
        } catch (e) {
            logger.error('fetch global character usage counts failed', e);
        }
    });

    const option = computed(() => {
        const counts = characterCounts.value;
        if (!counts || !characterMap.value || !selectedLayers.value.length) return undefined;
        return buildLayeredCharacterChartOption(
            counts,
            characterMap.value,
            selectedLayers.value,
            getCharacterDisplayName,
            { label: designTokens.colorInverseOnSurface.value, border: designTokens.colorSurfaceContainerLow.value },
            tooltipStyle('single'),
            chartType.value,
        );
    });

    return { option, selectedLayers, layerOptions: ATTRIBUTE_LAYER_OPTIONS, chartType };
}
