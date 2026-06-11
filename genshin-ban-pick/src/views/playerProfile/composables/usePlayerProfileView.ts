// src/views/playerProfile/composables/usePlayerProfileView.ts
//
// PlayerProfileView 的 view-model：吃一個 identity，組裝四個區塊的資料 +
// 顯示輔助。雷達交給 usePlayerStyleChart；match drill-down 的開窗狀態
// 屬 view 組裝層，留在 .vue。

import { pickTopCooccurrenceEntries } from '@shared/contracts/analysis/ICooccurrenceEntry';
import { toPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';
import { getTeamMemberName } from '@shared/contracts/team/TeamMember';
import { storeToRefs } from 'pinia';
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';

import type { Element } from '@shared/contracts/character/value-types';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IPlayerMatchSummary } from '@shared/contracts/player/IPlayerMatchSummary';
import type { IPlayerRecord } from '@shared/contracts/player/IPlayerRecord';
import type { IPlayerTeammate } from '@shared/contracts/player/IPlayerTeammate';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

import { createLogger } from '@/app/utils/logger';
import { useAnalysisMetaStore } from '@/modules/analysis';
import { useAnalysisUseCase } from '@/modules/analysis/ui/composables/useAnalysisUseCase';
import { usePlayerStyleChart } from '@/modules/analysis/ui/composables/usePlayerStyleChart';
import { useCharacterStore, useCharacterUseCase } from '@/modules/character';
import { usePlayerUseCase } from '@/modules/player';
import { getProfileImagePath } from '@/modules/shared/infrastructure/imageRegistry';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';

const logger = createLogger('playerProfile.view');

const TOP_COOCCURRENCE_COUNT = 3;
const dateFormatter = new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });

export function usePlayerProfileView(identity: MaybeRefOrGetter<PlayerIdentity | undefined>) {
    const playerUseCase = usePlayerUseCase();
    const analysisUseCase = useAnalysisUseCase();
    const characterUseCase = useCharacterUseCase();
    const { characterMap } = storeToRefs(useCharacterStore());
    const { characterCooccurrenceMatrix } = storeToRefs(useAnalysisMetaStore());
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();

    const styleChart = usePlayerStyleChart(identity);

    const isLoading = ref(false);
    const error = ref<string | undefined>(undefined);
    const record = ref<IPlayerRecord | undefined>(undefined);
    const matches = ref<IPlayerMatchSummary[]>([]);
    const teammates = ref<IPlayerTeammate[]>([]);

    watch(
        () => toValue(identity),
        async (id, _old, onCleanup) => {
            if (!id) return;
            let stale = false;
            onCleanup(() => {
                stale = true;
            });
            characterUseCase.loadCharacterMap().catch((e) => logger.warn('character map load failed', e));
            analysisUseCase.loadCharacterCooccurrenceMatrix().catch((e) => logger.warn('cooccurrence matrix load failed; chips omitted', e));

            isLoading.value = true;
            error.value = undefined;
            try {
                const [recordResult, matchesResult, teammatesResult] = await Promise.all([
                    playerUseCase.fetchPlayerRecord(id),
                    playerUseCase.fetchPlayerMatches(id),
                    playerUseCase.fetchPlayerTeammates(id),
                ]);
                if (stale) return;
                record.value = recordResult;
                matches.value = matchesResult;
                teammates.value = teammatesResult;
            } catch (e: any) {
                if (stale) return;
                error.value = e?.response?.data?.message ?? e?.message ?? '載入失敗';
                logger.error('fetch player profile failed', e);
            } finally {
                if (!stale) isLoading.value = false;
            }
        },
        { immediate: true },
    );

    const title = computed(() => {
        const teamMember = record.value?.teamMember;
        return teamMember ? getTeamMemberName(teamMember) : '玩家紀錄';
    });

    const characterFrequency = computed(() => {
        const matrix = characterCooccurrenceMatrix.value;
        return (record.value?.characterFrequency ?? []).map((f) => ({
            ...f,
            topCooccurrenceEntries: matrix ? pickTopCooccurrenceEntries(f.characterKey, matrix, TOP_COOCCURRENCE_COUNT) : [],
        }));
    });

    const maxCount = computed(() => record.value?.characterFrequency[0]?.count ?? 0);
    function getBarWidth(count: number): string {
        if (maxCount.value <= 0) return '0%';
        return `${(count / maxCount.value) * 100}%`;
    }

    function getRowStyle(characterKey: string) {
        const element = characterMap.value[characterKey]?.element as Element | undefined;
        return { '--row-accent': element ? elementColors[element].main : '#555555' };
    }

    function dateLabel(date: Date): string {
        return dateFormatter.format(date);
    }

    // 隊友列點擊 → 導去該隊友的 profile（route query）。cast 成 router 接受的 query 形狀
    function teammateQuery(teamMember: TeamMember): Record<string, string | number | undefined> {
        return { ...toPlayerIdentityQuery(teamMember) };
    }

    return {
        state: { isLoading, error, record, matches, teammates, title, characterFrequency },
        style: {
            radarOption: styleChart.radarOption,
            donutCharts: styleChart.donutCharts,
            isLoading: styleChart.isLoading,
            hasProfile: styleChart.hasProfile,
        },
        display: { getCharacterDisplayName, getProfileImagePath, getTeamMemberName, getBarWidth, getRowStyle, dateLabel, teammateQuery },
    };
}
