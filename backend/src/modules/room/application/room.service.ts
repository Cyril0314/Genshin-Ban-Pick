// backend/src/modules/room/application/room.service.ts

import { PrismaClient } from '@prisma/client';
import { createRoomSetting } from '../domain/createRoomSetting.ts';
import { IRoomStateRepository } from '../domain/IRoomStateRepository.ts';
import { createRoomState } from '../domain/createRoomState.ts';

export default class RoomService {
    constructor(
        private prisma: PrismaClient,
        private roomStateRepository: IRoomStateRepository
    ) {}

    fetchRooms() {
        return this.roomStateRepository.getAll();
    }

    buildRoom(roomId: string, payload: any) {
        const existing = this.roomStateRepository.get(roomId);
        if (existing) {
            return existing.roomSetting;
        }

        const roomSetting = createRoomSetting(payload);
        const roomState = createRoomState(roomSetting);
        this.roomStateRepository.set(roomId, roomState);

        return roomSetting;
    }

    getRoomSetting(roomId: string) {
        return this.roomStateRepository.get(roomId)?.roomSetting;
    }
}
