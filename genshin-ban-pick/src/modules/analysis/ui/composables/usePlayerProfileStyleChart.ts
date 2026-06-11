// src/modules/analysis/ui/composables/usePlayerProfileStyleChart.ts

import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';

import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { createLogger } from '@/app/utils/logger';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { buildStyleRadarOption, buildAttributeDonutOptions } from './buildPlayerStyleOption';

import type { IPlayerStyleProfile } from '@shared/contracts/analysis/IPlayerStyleProfile';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

const logger = createLogger('analysis.ui.playerProfileStyle');

export function usePlayerProfileStyleChart(identity: MaybeRefOrGetter<PlayerIdentity | undefined>) {
    const analysisUseCase = useAnalysisUseCase();
    const { tooltipStyle } = useEchartTheme();
    const designTokens = useDesignTokens();

    const isLoading = ref(false);
    const profile = ref<IPlayerStyleProfile | undefined>(undefined);

    watch(
        () => toValue(identity),
        async (id, _old, onCleanup) => {
            if (!id) {
                profile.value = undefined;
                return;
            }
            let stale = false;
            onCleanup(() => {
                stale = true;
            });
            isLoading.value = true;
            try {
                const result = await analysisUseCase.fetchPlayerStyleProfile(id);
                if (!stale) profile.value = result;
            } catch (e) {
                if (!stale) profile.value = undefined;
                logger.error('fetch player style failed', e);
            } finally {
                if (!stale) isLoading.value = false;
            }
        },
        { immediate: true },
    );

    const radarOption = computed(() => {
        const p = profile.value;
        if (!p) return undefined;
        return buildStyleRadarOption(
            p,
            {
                onSurface: designTokens.colorOnSurface.value,
                onSurfaceVariant: designTokens.colorOnSurfaceVariant.value,
                primary: designTokens.colorPrimary.value,
            },
            tooltipStyle('single'),
        );
    });

    const donutCharts = computed(() => {
        const p = profile.value;
        if (!p) return [];
        return buildAttributeDonutOptions(p.characterAttributeDistributions, designTokens.colorOnSurface.value, tooltipStyle('single'));
    });

    return { isLoading, radarOption, donutCharts, hasProfile: computed(() => !!profile.value) };
}
