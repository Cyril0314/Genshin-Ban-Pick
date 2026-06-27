// src/views/playerProfile/composables/usePlayerProfileModal.ts
//
// PlayerProfileModal 的 state & 載入邏輯。
// 吃進 props（open / identity）的 ref，自動 fetch 角色使用；
// 元件只負責 template 渲染。

import { getTeamMemberName } from '@shared/contracts/team/TeamMember';
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IPlayerCharacterUsage } from '@shared/contracts/player/IPlayerCharacterUsage';

import { createLogger } from '@/app/utils/logger';
import { usePlayerUseCase } from '@/modules/player';
import { computePlayerCharacterFrequency } from '@/modules/player/domain/computePlayerCharacterFrequency';

const logger = createLogger('playerProfile.modal');

export function usePlayerProfileModal(
    open: MaybeRefOrGetter<boolean>,
    identity: MaybeRefOrGetter<PlayerIdentity | undefined>,
) {
    const playerUseCase = usePlayerUseCase();

    const isLoading = ref(false);
    const usage = ref<IPlayerCharacterUsage | undefined>(undefined);
    const error = ref<string | undefined>(undefined);

    watch(
        [() => toValue(open), () => toValue(identity)],
        async ([isOpen, id]) => {
            if (!isOpen || !id) return;

            isLoading.value = true;
            error.value = undefined;
            usage.value = undefined;
            try {
                usage.value = await playerUseCase.fetchPlayerCharacterUsage(id);
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
        const teamMember = usage.value?.teamMember;
        return teamMember ? getTeamMemberName(teamMember) : '玩家紀錄';
    });

    // counts + setupCount → rate + 排序（呈現衍生，前端算）
    const characterFrequency = computed(() => (usage.value ? computePlayerCharacterFrequency(usage.value.characterCounts, usage.value.setupCount) : []));

    return { isLoading, usage, error, title, characterFrequency };
}
