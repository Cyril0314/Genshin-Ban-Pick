// src/views/playerProfile/composables/usePlayerProfileView.ts
//
// PlayerProfileView 的 view-model：吃一個 identity，組裝四個區塊的資料 +
// 顯示輔助。雷達交給 usePlayerStyleChart；match drill-down 的開窗狀態
// 屬 view 組裝層，留在 .vue。

import { toPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';
import { getTeamMemberName } from '@shared/contracts/team/TeamMember';
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IPlayerCharacterUsage } from '@shared/contracts/player/IPlayerCharacterUsage';
import type { IPlayerMatchSummary } from '@shared/contracts/player/IPlayerMatchSummary';
import type { IPlayerTeammate } from '@shared/contracts/player/IPlayerTeammate';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

import { createLogger } from '@/app/utils/logger';
import { usePlayerStyleChart } from '@/modules/analysis/ui/composables/usePlayerStyleChart';
import { useCharacterUseCase } from '@/modules/character';
import { usePlayerUseCase } from '@/modules/player';
import { computePlayerCharacterFrequency } from '@/modules/player/domain/computePlayerCharacterFrequency';
import { getProfileImagePath } from '@/modules/shared/infrastructure/imageRegistry';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';

const logger = createLogger('playerProfile.view');

const dateFormatter = new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });

const TOP_TEAMMATE_COUNT = 5;

export function usePlayerProfileView(identity: MaybeRefOrGetter<PlayerIdentity | undefined>) {
    const playerUseCase = usePlayerUseCase();
    const characterUseCase = useCharacterUseCase();
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();

    const styleChart = usePlayerStyleChart(identity);

    const isLoading = ref(false);
    const error = ref<string | undefined>(undefined);
    const usage = ref<IPlayerCharacterUsage | undefined>(undefined);
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

            isLoading.value = true;
            error.value = undefined;
            try {
                const [usageResult, matchesResult, teammatesResult] = await Promise.all([
                    playerUseCase.fetchPlayerCharacterUsage(id),
                    playerUseCase.fetchPlayerMatches(id),
                    playerUseCase.fetchPlayerTeammates(id),
                ]);
                if (stale) return;
                usage.value = usageResult;
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
        const teamMember = usage.value?.teamMember;
        return teamMember ? getTeamMemberName(teamMember) : '玩家紀錄';
    });

    // counts + setupCount → rate + 排序（呈現衍生，前端算）
    const characterFrequency = computed(() => (usage.value ? computePlayerCharacterFrequency(usage.value.characterCounts, usage.value.setupCount) : []));

    // 左上 overview 概況
    const matchCount = computed(() => matches.value.length);
    const characterCount = computed(() => characterFrequency.value.length);
    const signatureCharacter = computed(() => usage.value?.signatureCharacter);
    const teammateCount = computed(() => teammates.value.length);
    const setupCount = computed(() => usage.value?.setupCount ?? 0);

    const displayTeammates = computed(() => teammates.value.slice(0, TOP_TEAMMATE_COUNT));

    function dateLabel(date: Date): string {
        return dateFormatter.format(date);
    }

    // 隊友列點擊 → 導去該隊友的 profile（route query）。cast 成 router 接受的 query 形狀
    function teammateQuery(teamMember: TeamMember): Record<string, string | number | undefined> {
        return { ...toPlayerIdentityQuery(teamMember) };
    }

    return {
        state: { isLoading, error, usage, setupCount, matchCount, characterCount, teammateCount, signatureCharacter, matches, displayTeammates, title, characterFrequency },
        style: {
            radarOption: styleChart.radarOption,
            donutCharts: styleChart.donutCharts,
            isLoading: styleChart.isLoading,
            hasProfile: styleChart.hasProfile,
        },
        display: { getCharacterDisplayName, getProfileImagePath, getTeamMemberName, dateLabel, teammateQuery },
    };
}
