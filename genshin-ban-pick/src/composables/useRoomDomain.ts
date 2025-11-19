// src/composables/useRoomDomain.ts

import { roomService } from '@/network/roomService';
import type { IRoomSetting } from '@/types/IRoomSetting';
import type { IRoomState } from '@/types/IRoomState';
import type { ITeam } from '@/types/ITeam';

export function useRoomDomain() {
    async function fetchRooms(): Promise<Record<string, IRoomState>> {
        const response = await roomService.get();
        const rooms = response.data;
        return rooms;
    }

    async function build(
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
    ): Promise<IRoomSetting> {
        const response = await roomService.post(roomId, payload);
        const roomSetting = response.data;
        return roomSetting;
    }

    async function fetchSetting(roomId: string): Promise<IRoomSetting> {
        const response = await roomService.getSetting(roomId);
        const roomSetting = response.data;
        return roomSetting;
    }

    async function save(roomId: string) {
        const response = await roomService.postSave(roomId);
        return response.data;
    }

    return {
        fetchRooms,
        build,
        fetchSetting,
        save,
    };
}
