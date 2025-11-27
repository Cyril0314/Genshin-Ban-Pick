// backend/src/modules/room/application/room.service.ts

import IRoomStateRepository from '../domain/IRoomStateRepository';
import { createRoomSetting } from '../domain/createRoomSetting';
import { createRoomState } from '../domain/createRoomState';

export default class RoomService {
    constructor(private roomStateRepository: IRoomStateRepository) {}

    fetchRooms() {
        return this.roomStateRepository.findAll();
    }

    buildRoom(roomId: string, payload: any) {
        const existing = this.roomStateRepository.findById(roomId);
        if (existing) {
            return existing.roomSetting;
        }
        const roomSetting = createRoomSetting(payload);
        const roomState = createRoomState(roomSetting);
        this.roomStateRepository.create(roomId, roomState);

        return roomSetting;
    }

    getRoomSetting(roomId: string) {
        const existing = this.roomStateRepository.findById(roomId)?.roomSetting;
        if (!existing) {
            const roomSetting = createRoomSetting({});
            const roomState = createRoomState(roomSetting);
            this.roomStateRepository.create(roomId, roomState);
            return roomSetting
        }
        return existing;
    }
}
