// src/modules/room/ui/composables/useRoomList.ts

import { ref } from "vue";

import { useRoomUseCase } from "./useRoomUseCase";

import type { IRoomState } from '@shared/contracts/room/IRoomState';

export function useRoomList() {
    const rooms = ref<Record<string, IRoomState>>({});
    const isLoading = ref(true);
    const errorMessage = ref('');

    const roomUseCase = useRoomUseCase();

    async function loadRooms() {
        isLoading.value = true;
        try {
            rooms.value = await roomUseCase.fetchRooms();
            errorMessage.value = '';
        } catch (error: any) {
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
