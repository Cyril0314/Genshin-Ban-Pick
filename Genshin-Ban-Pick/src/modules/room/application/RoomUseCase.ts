// src/modules/room/application/RoomUseCase.ts

import type RoomRepository from '../infrastructure/RoomRepository';

export default class RoomUseCase {
    constructor(private roomRepository: RoomRepository) {}

    async fetchRooms() {
        const rooms = await this.roomRepository.fetchRooms();
        return rooms;
    }

    async buildRoom(roomId: string, payload: { numberOfUtility?: number; numberOfBan?: number; numberOfPick?: number }) {
        const roomSetting = await this.roomRepository.buildRoom(roomId, payload);
        return roomSetting;
    }

    async fetchRoomSetting(roomId: string) {
        const roomSetting = await this.roomRepository.fetchRoomSetting(roomId);
        return roomSetting;
    }
}
