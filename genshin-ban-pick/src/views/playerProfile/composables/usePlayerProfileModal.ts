// src/views/playerProfile/composables/usePlayerProfileModal.ts
//
// PlayerProfileModal 的 state & 載入邏輯。
// 吃進 props（open / identity）的 ref，自動 fetch record；
// 元件只負責 template 渲染。

import { pickTopCooccurrenceEntries } from '@shared/contracts/analysis/ICooccurrenceEntry';
import { getTeamMemberName } from '@shared/contracts/team/TeamMember';
import { storeToRefs } from 'pinia';
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';

import type { Element } from '@shared/contracts/character/value-types';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IPlayerRecord } from '@shared/contracts/player/IPlayerRecord';

import { createLogger } from '@/app/utils/logger';
import { useAnalysisMetaStore } from '@/modules/analysis';
import { useAnalysisUseCase } from '@/modules/analysis/ui/composables/useAnalysisUseCase';
import { useCharacterStore } from '@/modules/character';
import { usePlayerUseCase } from '@/modules/player';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';



const TOP_COOCCURRENCE_COUNT = 3;
const logger = createLogger('playerProfile.modal');

export function usePlayerProfileModal(
    open: MaybeRefOrGetter<boolean>,
    identity: MaybeRefOrGetter<PlayerIdentity | undefined>,
) {
    const playerUseCase = usePlayerUseCase();
    const analysisUseCase = useAnalysisUseCase();
    const { characterMap } = storeToRefs(useCharacterStore());
    const { characterCooccurrenceMatrix } = storeToRefs(useAnalysisMetaStore());
    const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();

    const isLoading = ref(false);
    const record = ref<IPlayerRecord | undefined>(undefined);
    const error = ref<string | undefined>(undefined);

    watch(
        [() => toValue(open), () => toValue(identity)],
        async ([isOpen, id]) => {
            if (!isOpen || !id) return;

            analysisUseCase.loadCharacterCooccurrenceMatrix().catch((e) => logger.warn('cooccurrence matrix load failed; chips omitted', e));

            isLoading.value = true;
            error.value = undefined;
            record.value = undefined;
            try {
                record.value = await playerUseCase.fetchPlayerRecord(id);
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

    // player record 只給參與事實；該角色的全域共現由組合視圖用 analysis 快取矩陣 enrich
    const characterFrequency = computed(() => {
        const matrix = characterCooccurrenceMatrix.value;
        return (record.value?.characterFrequency ?? []).map((f) => ({
            ...f,
            topCooccurrenceEntries: matrix ? pickTopCooccurrenceEntries(f.characterKey, matrix, TOP_COOCCURRENCE_COUNT) : [],
        }));
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

    return { isLoading, record, error, title, characterFrequency, getBarWidth, getRowStyle, getCharacterDisplayName };
}
