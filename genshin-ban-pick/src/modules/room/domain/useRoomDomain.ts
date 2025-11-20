// src/composables/useRoomDomain.ts

import { roomService } from '../infrastructure/roomService';
import type { ITeam } from '@/types/ITeam';

export async function fetchRoomsDomain() {
    const response = await roomService.get();
    const rooms = response.data;
    return rooms;
}

export async function buildDomain(
    roomId: string,
    payload: {
        numberOfUtility?: number;
        numberOfBan?: number;
        numberOfPick?: number;
        totalRounds?: number;
        teams?: ITeam[];
        numberOfTeamSetup?: number;
        numberOfSetupCharacter?: number;
    },
) {
    const response = await roomService.post(roomId, payload);
    const roomSetting = response.data;
    return roomSetting;
}

export async function fetchSettingDomain(roomId: string) {
    const response = await roomService.getSetting(roomId);
    const roomSetting = response.data;
    return roomSetting;
}

export async function saveDomain(roomId: string) {
    const response = await roomService.postSave(roomId);
    const id = response.data
    return id;
}
