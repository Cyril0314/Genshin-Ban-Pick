// src/network/roomService.ts

import api from './httpClient';

import type { HttpClient } from './httpClient';
import type { IRoomSetting } from '@/types/IRoomSetting';

export function createRoomService(client: HttpClient = api) {
    async function getSetting() {
        return client.get('/rooms/setting');
    }
    async function postSave({ roomId, roomSetting }: { roomId: string, roomSetting: IRoomSetting }) {
        return client.post(`/rooms/${roomId}/save`, roomSetting);
    }

    return {
        getSetting,
        postSave,
    };
}

export const roomService = createRoomService();
