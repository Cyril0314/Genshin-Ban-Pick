// src/modules/room/infrastructure/RoomRepository.ts

import type { ITeam } from "@shared/contracts/team/ITeam";
import type RoomService from "./RoomService";

export default class RoomRepository {
    constructor(private roomService: RoomService) {}

    async buildRoom(
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
        const response = await this.roomService.post(roomId, payload);
        const roomSetting = response.data;
        return roomSetting;
    }

    async fetchRooms() {
        const response = await this.roomService.get();
        const rooms = response.data;
        return rooms;
    }

    async fetchRoomSetting(roomId: string) {
        const response = await this.roomService.getSetting(roomId);
        const roomSetting = response.data;
        return roomSetting;
    }
}