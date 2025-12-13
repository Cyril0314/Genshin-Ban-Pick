// src/backend/modules/room/application/roomUser.service.ts

import { createLogger } from '../../../utils/logger';
import { joinRoomUser } from '../domain/joinRoomUser';
import { leaveRoomUser } from '../domain/leaveRoomUser';

import type { IRoomStateRepository } from '../domain/IRoomStateRepository';

const logger = createLogger('ROOM_USER');

export default class RoomUserService {
    constructor(private roomStateRepository: IRoomStateRepository) {}

    join(roomId: string, { identityKey, nickname, socketId }: { identityKey: string; nickname: string; socketId: string }) {
        const prevRoomUsers = this.roomStateRepository.findRoomUsersById(roomId);
        const { joinedUser, roomUsers } = joinRoomUser(prevRoomUsers, identityKey, nickname, socketId)

        this.roomStateRepository.updateRoomUsersById(roomId, roomUsers)

        return { joinedUser, roomUsers }
    }

    leave(roomId: string, identityKey: string) {
        const roomState = this.roomStateRepository.findById(roomId);
        if (!roomState) return { leavingUser: null, roomUsers: [] };

        const { leavingUser, roomUsers } = leaveRoomUser(roomState.users, identityKey)
        this.roomStateRepository.updateRoomUsersById(roomId, roomUsers)

        return { leavingUser, roomUsers };
    }
}
