// src/modules/analysis/ui/composables/useMatchOverviewChart.ts

import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import tinycolor from 'tinycolor2';

import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useAuthStore } from '@/modules/auth';
import { useAnalysisUseCase } from './useAnalysisUseCase';
import { useMatchUseCase } from '@/modules/match';
import { useCharacterStore } from '@/modules/character';
import { useGenshinVersionUseCase } from '@/modules/genshinVersion';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { chartColors } from '@/modules/shared/ui/constants/chartColors';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';

import type { IGenshinVersionPeriod } from '@shared/contracts/genshinVersion/IGenshinVersionPeriod';
import type { ICharacter } from '@shared/contracts/character/ICharacter';
import type { IMatchTimeMinimal } from '@shared/contracts/analysis/IMatchTimeMinimal';
import type { IAnalysisOverview } from '@shared/contracts/analysis/IAnalysisOverview';

export function useMatchOverviewChart() {
    const { tooltipStyle, gridStyle, dataZoomStyle, timeAxisStyle } = useEchartTheme();
    const designTokens = useDesignTokens();
    const authStore = useAuthStore();
    const { identity } = storeToRefs(authStore);

    const genshinVersionUseCase = useGenshinVersionUseCase();
    const analysisUseCase = useAnalysisUseCase();
    const matchUseCase = useMatchUseCase();

    const characterStore = useCharacterStore();
    const { characterMap } = storeToRefs(characterStore);

    const { getByKey } = useCharacterDisplayName();

    const overview = ref<IAnalysisOverview>();
    const periods = ref<IGenshinVersionPeriod[]>();
    const matchTimeline = ref<IMatchTimeMinimal[]>();

    onMounted(async () => {
        const [overviewResult, periodsResult, matchTimelineResult] = await Promise.all([
            analysisUseCase.fetchOverview(),
            genshinVersionUseCase.fetchGenshinVersionPeriods(),
            analysisUseCase.fetchMatchTimeline(),
        ]);

        overview.value = overviewResult;
        periods.value = periodsResult;
        matchTimeline.value = matchTimelineResult;
    });

    const option = computed(() => {
        if (!periods.value || periods.value.length === 0) return undefined;

        const minPeriod = periods.value[0].startAt;
        const maxPeriod = periods.value[periods.value.length - 1].endAt ?? new Date();

        const versionMarkAreas = periods.value.map((period, index) => [
            {
                xAxis: period.startAt,
                yAxis: 0,
                itemStyle: {
                    color: tinycolor(chartColors[index % chartColors.length])
                        .brighten(20)
                        .toRgbString(),
                    opacity: 0.4,
                },
                label: {
                    show: true,
                    formatter: period.code,
                    position: 'insideBottom',
                    color: 'inherit',
                },
            },
            {
                xAxis: period.endAt ?? new Date(),
                yAxis: 1,
            },
        ]);

        const grouped = Object.values(characterMap.value)
            .filter((c) => c.releaseAt)
            .reduce(
                (acc, c) => {
                    const dateKey = c.releaseAt!.toISOString().slice(0, 10);
                    if (!acc[dateKey]) {
                        acc[dateKey] = {
                            dateKey,
                            releaseAt: c.releaseAt!,
                            characters: [],
                        };
                    }
                    acc[dateKey].characters.push(c);
                    return acc;
                },
                {} as Record<string, { dateKey: string; releaseAt: Date; characters: ICharacter[] }>,
            );

        const characterReleaseData = Object.values(grouped).map((group) => {
            return {
                value: [group.releaseAt, 0.1],
                characters: group.characters,
                itemStyle: {
                    color: '#ccc',
                },
                symbol: 'pin'
            };
        });

        const matchData =
            matchTimeline.value?.map((m) => ({
                value: [m.createdAt, 0.5],
                id: m.id,
                type: 'match',
                itemStyle: {
                    color: chartColors[0],
                    opacity: 0.6,
                },
            })) ?? [];

        return {
            tooltip: {
                ...tooltipStyle('single'),
                position: 'top',
                formatter: (params: any) => {
                    const date = params.value[0];
                    const dateStr = date instanceof Date ? date.toLocaleDateString() : date;

                    if (params.data.type === 'match') {
                        return `
                        <div style="font-weight: bold; margin-bottom: 4px;">${dateStr}</div>
                    `;
                    } else {
                        const characters = params.data.characters as any[];
                        const list = characters.map((c) => `<div>${getByKey(c.key)}</div>`).join('');

                        return `
                        <div style="font-weight: bold; margin-bottom: 4px;">${dateStr}</div>
                        <div style="font-size: 0.9em; color: #aaaaaa">
                            ${list}
                        </div>
                    `;
                    }
                },
            },
            grid: {
                ...gridStyle('tight', true),
            },

            xAxis: {
                // type: 'time',
                ...timeAxisStyle(),
                min: minPeriod,
                max: maxPeriod,
                // axisLine: { show: false },
                // axisTick: { show: false },
                // axisLabel: { show: true },
            },

            yAxis: {
                type: 'value',
                min: 0,
                max: 1,
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false },
                splitLine: { show: false },
            },
            dataZoom: [
                {
                    ...dataZoomStyle,
                    type: 'inside',
                    start: 80,
                    end: 100,
                    xAxisIndex: 0,
                },
            ],
            series: [
                {
                    type: 'line',
                    data: [],
                    markArea: {
                        silent: true,
                        // itemStyle: {
                        //     color: 'rgba(0, 0, 0, 0.1)',
                        // },
                        data: versionMarkAreas,
                    },
                },
                {
                    type: 'scatter',
                    symbolSize: 12,
                    data: characterReleaseData,
                    tooltip: {
                        show: true,
                    },
                },
                {
                    type: 'scatter',
                    symbolSize: 12,
                    data: matchData,
                    tooltip: {
                        show: true,
                    },
                },
            ],
        };
    });

    watch(option, async () => {
        console.log(option.value);
    });

    return {
        overview,
        option,
    };
}
