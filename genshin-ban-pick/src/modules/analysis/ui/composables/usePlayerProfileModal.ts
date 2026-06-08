// src/modules/analysis/ui/composables/usePlayerProfileModal.ts
//
// PlayerProfileModal 的 state & 載入邏輯。
// 吃進 props（open / identity）的 ref，自動 fetch record；
// 元件只負責 template 渲染。

import { getTeamMemberName } from '@shared/contracts/team/TeamMember';
import { storeToRefs } from 'pinia';
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';

import { useAnalysisUseCase } from './useAnalysisUseCase';

import type { IPlayerRecord } from '@shared/contracts/analysis/IPlayerRecord';
import type { Element } from '@shared/contracts/character/value-types';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

import { createLogger } from '@/app/utils/logger';
import { useCharacterStore } from '@/modules/character';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';



const logger = createLogger('analysis.ui.playerProfile');

export function usePlayerProfileModal(
    open: MaybeRefOrGetter<boolean>,
    identity: MaybeRefOrGetter<PlayerIdentity | undefined>,
) {
    const analysisUseCase = useAnalysisUseCase();
    const { characterMap } = storeToRefs(useCharacterStore());
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();

    const isLoading = ref(false);
    const record = ref<IPlayerRecord | undefined>(undefined);
    const error = ref<string | undefined>(undefined);

    watch(
        [() => toValue(open), () => toValue(identity)],
        async ([isOpen, id]) => {
            if (!isOpen || !id) return;
            isLoading.value = true;
            error.value = undefined;
            record.value = undefined;
            try {
                record.value = await analysisUseCase.fetchPlayerRecord(id);
            } catch (e: any) {
                error.value = e?.response?.data?.message ?? e?.message ?? '載入失敗';
                logger.error('fetch failed', e);
            } finally {
                isLoading.value = false;
            }
        },
    );

    // ---- View shape ----

    const title = computed(() => {
        const teamMember = record.value?.teamMember;
        return teamMember ? getTeamMemberName(teamMember) : '玩家紀錄';
    });

    // bar 寬度分母：Top 1 的 count
    const maxCount = computed(() => record.value?.characterFrequency[0]?.count ?? 0);
    function getBarWidth(count: number): string {
        if (maxCount.value <= 0) return '0%';
        return `${(count / maxCount.value) * 100}%`;
    }

    // 角色 → element → 主題色，作為 row 左側 accent；找不到 element 用中性灰
    function getElementAccent(characterKey: string): string {
        const element = characterMap.value[characterKey]?.element as Element | undefined;
        return element ? elementColors[element].main : '#555555';
    }
    function getRowStyle(characterKey: string) {
        return { '--row-accent': getElementAccent(characterKey) };
    }

    return { isLoading, record, error, title, getBarWidth, getRowStyle, getCharacterDisplayName };
}
