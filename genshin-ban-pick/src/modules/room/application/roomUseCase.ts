// src/modules/room/application/roomUseCase.ts

import { fetchRoomsDomain } from '../domain/fetchRoomsDomain';
import { buildRoomDomain } from '../domain/buildRoomDomain';
import { fetchRoomSettingDomain } from '../domain/fetchRoomSettingDomain';
import { saveRoomDomain } from '../domain/saveRoomDomain';
import { useRoomUserStore } from '../store/roomUserStore';

export function roomUseCase() {
    const roomUserStore = useRoomUserStore();

    async function fetchRooms() {
        const rooms = await fetchRoomsDomain();
        return rooms;
    }

    async function buildRoom(roomId: string, payload: { numberOfUtility?: number; numberOfBan?: number; numberOfPick?: number }) {
        const roomSetting = await buildRoomDomain(roomId, payload);
        return roomSetting;
    }

    async function fetchRoomSetting(roomId: string) {
        const roomSetting = await fetchRoomSettingDomain(roomId);
        return roomSetting;
    }

    async function saveRoom(roomId: string) {
        const id = await saveRoomDomain(roomId);
        return id;
    }

    return {
        fetchRooms,
        buildRoom,
        fetchRoomSetting,
        saveRoom,
    };
}
