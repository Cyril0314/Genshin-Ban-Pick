// src/modules/room/application/useRoomUseCase.ts

import { fetchRoomsDomain, buildDomain, fetchSettingDomain, saveDomain } from '../domain/useRoomDomain';
import { useRoomUserStore } from '../store/roomUserStore';

export function useRoomUseCase() {
    const roomUserStore = useRoomUserStore();

    async function fetchRooms() {
        const rooms = await fetchRoomsDomain();
        return rooms;
    }

    async function build(roomId: string, payload: { numberOfUtility?: number; numberOfBan?: number; numberOfPick?: number; }) {
        const roomSetting = await buildDomain(roomId, payload);
        return roomSetting;
    }

    async function fetchSetting(roomId: string) {
        const roomSetting = await fetchSettingDomain(roomId);
        return roomSetting;
    }

    async function save(roomId: string) {
        const id = await saveDomain(roomId);
        return id;
    }

    return {
        fetchRooms,
        build,
        fetchSetting,
        save,
    };
}
