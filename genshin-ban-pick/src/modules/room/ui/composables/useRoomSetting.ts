// src/modules/room/ui/composables/useRoomSetting.ts

import { reactive, ref } from 'vue';

import { createLogger } from '@/app/utils/logger';
import { useRoomUseCase } from './useRoomUseCase';

const logger = createLogger('room.ui.roomSetting');

export function useRoomSetting() {
    const roomUseCase = useRoomUseCase();

    const form = reactive({
        roomId: 'default-room',
        numberOfUtility: 4,
        numberOfBan: 8,
        numberOfPick: 32,
    });

    const isLoading = ref(false);
    const errorMessage = ref('');

    async function submit() {
        logger.debug('submit room setting', { roomId: form.roomId, numberOfUtility: form.numberOfUtility, numberOfBan: form.numberOfBan, numberOfPick: form.numberOfPick });
        isLoading.value = true;
        errorMessage.value = '';

        try {
            await roomUseCase.buildRoom(form.roomId, {
                numberOfUtility: form.numberOfUtility,
                numberOfBan: form.numberOfBan,
                numberOfPick: form.numberOfPick,
            });

            logger.debug('room built ok', form.roomId);
            return true; // success
        } catch (err: any) {
            logger.error('build room failed', err);
            errorMessage.value = err.response?.data?.message || '建立房間失敗';
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        form,
        isLoading,
        errorMessage,
        submit,
    };
}
