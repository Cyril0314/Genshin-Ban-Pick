// src/modules/room/application/RoomUseCase.ts

import type { useRoomUserStore } from '../store/roomUserStore';
import type { IRoomUser } from '@shared/contracts/room/IRoomUser';

export default class RoomUserUseCase {
    constructor(private roomUserStore: ReturnType<typeof useRoomUserStore>) {}

    setRoomUsers(roomUsers: IRoomUser[]) {
        this.roomUserStore.setRoomUsers(roomUsers)
    }
}
