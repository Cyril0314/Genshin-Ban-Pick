// src/modules/banPick/ui/composables/useBanPickMatchSave.vue

import { ref } from 'vue';

import { useMatchUseCase } from '@/modules/match';

import type { IMatch } from '@shared/contracts/match/IMatch';

export function useBanPickMatchSave(roomId: string) {
    const matchUseCase = useMatchUseCase();

    const result = ref<IMatch>()
    const isLoading = ref(false);
    const error = ref<string>();

    async function matchSave() {
        isLoading.value = true;
        error.value = undefined;

        try {
            result.value = await matchUseCase.saveMatch(roomId);
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
