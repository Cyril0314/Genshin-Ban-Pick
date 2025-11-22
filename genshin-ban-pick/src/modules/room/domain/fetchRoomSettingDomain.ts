// src/modules/room/domain/fetchRoomSettingDomain.ts

import { roomService } from '../infrastructure/roomService';

export async function fetchRoomSettingDomain(roomId: string) {
    const response = await roomService.getSetting(roomId);
    const roomSetting = response.data;
    return roomSetting;
}
