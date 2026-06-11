// src/views/banPick/composables/useBanPickMatchSave.ts

import { ref } from 'vue';

import { createLogger } from '@/app/utils/logger';
import { useMatchUseCase } from '@/modules/match';

const logger = createLogger('banPick.matchSave');

import type { IMatch } from '@shared/contracts/match/IMatch';

export function useBanPickMatchSave(roomId: string) {
    const matchUseCase = useMatchUseCase();

    const result = ref<IMatch>()
    const isLoading = ref(false);
    const error = ref<string>();

    async function matchSave() {
        logger.debug('saving match', roomId);
        isLoading.value = true;
        error.value = undefined;

        try {
            result.value = await matchUseCase.saveMatch(roomId);
        } catch (err: any) {
            logger.error('save match failed', err);
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
