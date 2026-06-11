// src/modules/analysis/ui/composables/useCharacterAttributeDistributionsChart.ts

import { computed, onMounted, ref } from 'vue';

import { createLogger } from '@/app/utils/logger';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { buildAttributeDonutOptions } from './buildPlayerStyleOption';
import { useAnalysisUseCase } from './useAnalysisUseCase';

import type { ICharacterAttributeDistributions } from '@shared/contracts/analysis/character/ICharacterAttributeDistributions';

const logger = createLogger('analysis.ui.characterAttributeDistributionsChart');

export function useCharacterAttributeDistributionsChart() {
    const { tooltipStyle } = useEchartTheme();
    const designTokens = useDesignTokens();
    const analysisUseCase = useAnalysisUseCase();

    const characterAttributeDistributions = ref<ICharacterAttributeDistributions>();

    onMounted(async () => {
        try {
            characterAttributeDistributions.value = await analysisUseCase.fetchCharacterAttributeDistributions();
        } catch (e) {
            logger.error('fetch global attribute distributions failed', e);
        }
    });

    const donutCharts = computed(() => {
        const d = characterAttributeDistributions.value;
        if (!d) return [];
        return buildAttributeDonutOptions(d, designTokens.colorOnSurface.value, tooltipStyle('single'));
    });

    return { donutCharts };
}
