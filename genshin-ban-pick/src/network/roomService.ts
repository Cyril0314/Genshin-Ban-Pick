// src/network/roomService.ts
import type { IRoomSetting } from '@/types/IRoomSetting';

export async function fetchRoomSetting(): Promise<IRoomSetting> {
    const response = await fetch('/api/rooms/setting');
    const roomSetting = await response.json();
    return roomSetting;
}

export async function postRoomSave(roomId: string, roomSetting: IRoomSetting) {
    const response = await fetch(`/api/rooms/${roomId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomSetting),
    });
    return response.json();
}
