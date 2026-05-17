// src/modules/analysis/ui/composables/usePlayerHistoryModal.ts
//
// PlayerHistoryModal 的 state & 載入邏輯。
// 吃進 props（open / identity）的 ref，自動 fetch record；
// 元件只負責 template 渲染。

import { ref, watch, type Ref } from 'vue';

import { useAnalysisUseCase } from './useAnalysisUseCase';

import type { PlayerIdentity } from '@shared/contracts/player/PlayerIdentity';
import type { IPlayerRecord } from '@shared/contracts/analysis/IPlayerRecord';

export function usePlayerHistoryModal(
    open: Ref<boolean>,
    identity: Ref<PlayerIdentity | undefined>,
) {
    const analysisUseCase = useAnalysisUseCase();

    const isLoading = ref(false);
    const record = ref<IPlayerRecord | undefined>(undefined);
    const error = ref<string | undefined>(undefined);

    watch(
        [open, identity],
        async ([isOpen, id]) => {
            if (!isOpen || !id) return;
            isLoading.value = true;
            error.value = undefined;
            record.value = undefined;
            try {
                record.value = await analysisUseCase.fetchPlayerRecord(id);
            } catch (e: any) {
                error.value = e?.response?.data?.message ?? e?.message ?? '載入失敗';
                console.error('[PLAYER HISTORY] fetch failed', e);
            } finally {
                isLoading.value = false;
            }
        },
    );

    return { isLoading, record, error };
}
