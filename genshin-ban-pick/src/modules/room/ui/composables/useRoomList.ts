// src/modules/room/ui/composables/useRoomList.ts

import { ref } from "vue";

import { createLogger } from '@/app/utils/logger';
import { useRoomUseCase } from "./useRoomUseCase";

const logger = createLogger('room.ui.roomList');

import type { IRoomState } from '@shared/contracts/room/IRoomState';

export function useRoomList() {
    const rooms = ref<Record<string, IRoomState>>({});
    const isLoading = ref(true);
    const errorMessage = ref('');

    const roomUseCase = useRoomUseCase();

    async function loadRooms() {
        logger.debug('loading rooms');
        isLoading.value = true;
        try {
            rooms.value = await roomUseCase.fetchRooms();
            logger.debug('rooms loaded', Object.keys(rooms.value).length);
            errorMessage.value = '';
        } catch (error: any) {
            logger.error('load rooms failed', error);
            errorMessage.value = error?.message ?? '無法載入房間列表';
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading,
        errorMessage,
        rooms,
        loadRooms
    }
}
