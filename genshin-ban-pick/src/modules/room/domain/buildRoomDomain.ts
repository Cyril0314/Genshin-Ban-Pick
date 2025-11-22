// src/modules/room/domain/buildRoomDomain.ts

import { roomService } from '../infrastructure/roomService';

import type { ITeam } from '@/modules/team';

export async function buildRoomDomain(
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
