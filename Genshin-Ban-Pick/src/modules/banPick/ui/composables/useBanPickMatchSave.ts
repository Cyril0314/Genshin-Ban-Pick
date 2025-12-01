// src/modules/banPick/ui/composables/useBanPickMatchSave.vue

import { ref } from 'vue';
import { matchUseCase } from '@/modules/match';

import type { IMatch } from '@shared/contracts/match/IMatch';

export function useBanPickMatchSave(roomId: string) {
    const { saveMatch } = matchUseCase();

    const result = ref<IMatch | null>(null)
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
