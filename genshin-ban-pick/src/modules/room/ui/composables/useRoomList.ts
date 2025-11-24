// src/modules/room/ui/composables/useRoomList.ts

import { ref } from "vue";

import { roomUseCase } from "../../application/roomUseCase";

import type { IRoomState } from "../../types/IRoomState";

export function useRoomList() {
    const rooms = ref<Record<string, IRoomState>>({});
    const isLoading = ref(true);
    const errorMessage = ref('');

    const { fetchRooms } = roomUseCase();

    async function loadRooms() {
        isLoading.value = true;
        try {
            rooms.value = await fetchRooms();
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
