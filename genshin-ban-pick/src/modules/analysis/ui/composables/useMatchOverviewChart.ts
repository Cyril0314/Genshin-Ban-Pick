// src/modules/analysis/ui/composables/useMatchOverviewChart.ts

import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

import { useAnalysisUseCase } from './useAnalysisUseCase';

import type { IAnalysisOverview } from '@shared/contracts/analysis/IAnalysisOverview';
import type { ICharacter } from '@shared/contracts/character/ICharacter';
import type { IGenshinVersionPeriod } from '@shared/contracts/genshinVersion/IGenshinVersionPeriod';
import type { IMatchTimestamp } from '@shared/contracts/match/IMatchTimestamp';

import { createLogger } from '@/app/utils/logger';
import { useCharacterStore } from '@/modules/character';
import { useGenshinVersionUseCase } from '@/modules/genshinVersion';
import { useMatchUseCase } from '@/modules/match';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { useDesignTokens } from '@/modules/shared/ui/composables/useDesignTokens';
import { useEchartTheme } from '@/modules/shared/ui/composables/useEchartTheme';
import { useMatchHistoryController } from '@/modules/shared/ui/context/matchHistoryContext';


const logger = createLogger('analysis.ui.matchOverview');

const LANE_CHARACTER = '角色';
const LANE_MATCH = '場次';

export function useMatchOverviewChart() {
    const { tooltipStyle, gridStyle, dataZoomStyle, timeAxisStyle, categoryAxisStyle } = useEchartTheme();
    const designTokens = useDesignTokens();
    const genshinVersionUseCase = useGenshinVersionUseCase();
    const analysisUseCase = useAnalysisUseCase();
    const matchUseCase = useMatchUseCase();

    const characterStore = useCharacterStore();
    const { characterMap } = storeToRefs(characterStore);

    const { getByKey } = useCharacterDisplayName();
    const matchHistory = useMatchHistoryController();

    const overview = ref<IAnalysisOverview>();
    const periods = ref<IGenshinVersionPeriod[]>();
    const matchTimeline = ref<IMatchTimestamp[]>();

    onMounted(async () => {
        logger.debug('fetching overview + version periods + match timeline');
        const [overviewResult, periodsResult, matchTimelineResult] = await Promise.all([
            analysisUseCase.fetchOverview(),
            genshinVersionUseCase.fetchGenshinVersionPeriods(),
            matchUseCase.fetchMatchTimestamps(),
        ]);

        periodsResult.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

        overview.value = overviewResult;
        periods.value = periodsResult;
        matchTimeline.value = matchTimelineResult;
        logger.debug('data loaded', { periods: periodsResult.length, matches: matchTimelineResult.length });
    });

    const option = computed(() => {
        if (!periods.value || periods.value.length === 0) return undefined;

        const minPeriod = periods.value[0].startAt;
        const maxPeriod = periods.value[periods.value.length - 1].endAt ?? new Date();

        const bandLow = designTokens.colorSurfaceContainerLow.value;
        const bandHigh = designTokens.colorSurfaceContainerHighest.value;
        const mutedColor = designTokens.colorOnSurfaceVariant.value;

        const versionMarkAreas = periods.value.map((period, index) => [
            {
                xAxis: period.startAt,
                itemStyle: {
                    color: index % 2 === 0 ? bandLow : bandHigh,
                    opacity: 0.55,
                },
                label: {
                    show: true,
                    formatter: period.code,
                    position: 'insideTop',
                    color: mutedColor,
                    fontSize: parseFloat(designTokens.fontSizeSm.value),
                    distance: 4,
                },
            },
            {
                xAxis: period.endAt ?? new Date(),
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

        const characterReleaseData = Object.values(grouped).map((group) => ({
            value: [group.releaseAt, LANE_CHARACTER],
            characters: group.characters,
        }));

        const matchData =
            matchTimeline.value?.map((m) => ({
                value: [m.createdAt, LANE_MATCH],
                id: m.id,
                type: 'match',
            })) ?? [];

        return {
            tooltip: {
                ...tooltipStyle('single'),
                position: 'top',
                transitionDuration: 0,
                formatter: (params: any) => {
                    const date = params.value[0];
                    const dateStr = date instanceof Date ? date.toLocaleDateString() : date;

                    if (params.data.type === 'match') {
                        return `<div style="font-weight: bold;">${dateStr}</div>`;
                    }
                    const characters = params.data.characters as any[];
                    const list = characters.map((c) => `<div>${getByKey(c.key)}</div>`).join('');
                    return `
                        <div style="font-weight: bold; margin-bottom: 4px;">${dateStr}</div>
                        <div style="font-size: 0.9em; color: ${mutedColor}">${list}</div>
                    `;
                },
            },
            grid: {
                ...gridStyle('tight', true),
                containLabel: true,
            },
            xAxis: {
                ...timeAxisStyle(),
                min: minPeriod,
                max: maxPeriod,
            },
            yAxis: {
                ...categoryAxisStyle(),
                data: [LANE_CHARACTER, LANE_MATCH],
                axisLine: { show: false },
                axisLabel: {
                    color: mutedColor,
                    fontSize: parseFloat(designTokens.fontSizeSm.value),
                    fontWeight: parseFloat(designTokens.fontWeightMedium.value!),
                },
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
                        data: versionMarkAreas,
                    },
                },
                {
                    type: 'scatter',
                    name: LANE_CHARACTER,
                    data: characterReleaseData,
                    symbol: 'circle',
                    symbolSize: 16,
                    itemStyle: {
                        color: mutedColor,
                        opacity: 0.65,
                    },
                    emphasis: { disabled: true },
                    tooltip: { show: true },
                },
                {
                    type: 'scatter',
                    name: LANE_MATCH,
                    data: matchData,
                    symbol: 'circle',
                    symbolSize: 16,
                    cursor: 'pointer',
                    itemStyle: {
                        color: designTokens.colorPrimary.value,
                    },
                    emphasis: { disabled: true },
                    tooltip: { show: true },
                },
            ],
        };
    });

    // 依時間（epoch ms）找最接近的 match，供 canvas 點擊就近開窗使用。
    function findNearestMatch(timeMs: number): IMatchTimestamp | undefined {
        const list = matchTimeline.value;
        if (!list || list.length === 0) return undefined;
        return list.reduce((best, m) =>
            Math.abs(m.createdAt.getTime() - timeMs) < Math.abs(best.createdAt.getTime() - timeMs) ? m : best,
        );
    }

    function openMatch(id: number) {
        matchHistory.open(id);
    }

    return {
        overview,
        option,
        findNearestMatch,
        openMatch,
    };
}
