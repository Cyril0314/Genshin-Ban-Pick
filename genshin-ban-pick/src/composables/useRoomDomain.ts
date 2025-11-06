// src/composables/useRoomDomain.ts

import { roomService } from '@/network/roomService';
import type { IRoomSetting } from '@/types/IRoomSetting';

export function useRoomDomain() {
    async function fetchSetting(): Promise<IRoomSetting> {
        const response = await roomService.getSetting();
        const roomSetting = response.data;
        return roomSetting;
    }
    
    async function save(payload: { roomId: string, roomSetting: IRoomSetting }) {
        const response = await roomService.postSave(payload);
        return response.data
    }

    return {
        fetchSetting,
        save
    }
}
