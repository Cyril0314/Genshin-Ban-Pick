import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useAuthStore } from '@/modules/auth';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import type { IPlayerStyleStats } from '@shared/contracts/analysis/IPlayerStyleStats';

export function usePlayerStyleChart() {
    const { tooltipStyle } = useEchartTheme()
    const designTokens = useDesignTokens();
    const authStore = useAuthStore();
    const { identity } = storeToRefs(authStore);

    const analysisUseCase = useAnalysisUseCase();
    const playerStyle = ref<IPlayerStyleStats | null>(null);

    onMounted(async () => {
        if (identity.value?.type === 'Member' && identity.value.user.id) {
            playerStyle.value = await analysisUseCase.fetchPlayerStyle(1);
        }
    });

    const option = computed(() => {
        if (!playerStyle.value) return null;

        const stats = playerStyle.value;

        return {
            tooltip: {
                ...tooltipStyle('single'),
            },
            radar: {
                indicator: [
                    { name: '進攻型 (Aggression)', max: 100 },
                    { name: '防守型 (Support)', max: 100 },
                    { name: '冷門角 (Versatility)', max: 100 },
                    { name: 'Meta (Meta Affinity)', max: 100 },
                    { name: '元素偏好 (Element Bias)', max: 100 },
                    { name: '武器偏好 (Weapon Bias)', max: 100 }
                ],
                splitNumber: 4,
                axisName: {
                    color: designTokens.colorOnSurface.value,
                },
                splitLine: {
                    lineStyle: {
                        color: designTokens.colorOnSurfaceVariant.value,
                    },
                },
                splitArea: {
                    show: false,
                },
                axisLine: {
                    lineStyle: {
                        color: designTokens.colorOnSurfaceVariant.value,
                    },
                },
            },
            series: [
                {
                    type: 'radar',
                    data: [
                        {
                            value: [stats.aggression, stats.support, stats.versatility, stats.metaAffinity, stats.elementBias, stats.weaponBias],
                            name: '玩家風格',
                            itemStyle: {
                                color: designTokens.colorPrimary.value,
                            },
                            areaStyle: {
                                color: designTokens.colorPrimary.value,
                                opacity: 0.2,
                            },
                            emphasis: {
                                itemStyle: { color: designTokens.colorPrimary.value },
                                areaStyle: {
                                    color: designTokens.colorPrimary.value,
                                    opacity: 0.35,
                                },
                            },
                        },
                    ],
                },
            ],
        };
    });

    return { option };
}
