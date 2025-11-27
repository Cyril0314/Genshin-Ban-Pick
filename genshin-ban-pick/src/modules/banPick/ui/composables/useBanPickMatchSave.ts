// src/modules/banPick/ui/composables/useBanPickMatchSave.vue

import { ref } from 'vue';
import type { IMatchResult } from '@/modules/match/types/IMatchResult';
import { matchUseCase } from '@/modules/match';

export function useBanPickMatchSave(roomId: string) {
    const { saveMatch } = matchUseCase();

    const result = ref<IMatchResult | null>(null)
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    async function matchSave() {
        isLoading.value = true;
        error.value = null;

        try {
            result.value = await saveMatch(roomId);
        } catch (err: any) {
            error.value = err?.response?.data?.message ?? '儲存失敗';
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    return { 
        matchSave,
        result, 
        isLoading, 
        error
     };
}
