// src/backend/modules/room/application/roomUser.service.ts

import { DataNotFoundError } from '../../../errors/AppError';
import { createLogger } from '../../../utils/logger';
import { findUserTeamSlot } from '../domain/findUserTeamSlot';
import { joinRoomUser } from '../domain/joinRoomUser';
import { leaveRoomUser } from '../domain/leaveRoomUser';

import type { IRoomStateRepository } from '../domain/IRoomStateRepository';

const logger = createLogger('ROOM_USER');

export default class RoomUserService {
    constructor(private roomStateRepository: IRoomStateRepository) {}

    join(roomId: string, identity: { identityKey: string; nickname: string; socketId: string }) {
        const roomState = this.roomStateRepository.findById(roomId);
        if (!roomState) throw new DataNotFoundError();

        const {joinedUser, isReconnect, roomUsers } = joinRoomUser(roomState.users, identity)

        this.roomStateRepository.updateRoomUsersById(roomId, roomUsers)

        const userTeamSlot = findUserTeamSlot(roomState.teamMembersMap, identity.identityKey)

        return { joinedUser, isReconnect, roomUsers, userTeamSlot }
    }

    leave(roomId: string, identityKey: string) {
        const roomState = this.roomStateRepository.findById(roomId);
        if (!roomState) return { leavingUser: null, roomUsers: [] };

        const { leavingUser, roomUsers } = leaveRoomUser(roomState.users, identityKey)
        this.roomStateRepository.updateRoomUsersById(roomId, roomUsers)

        return { leavingUser, roomUsers };
    }
}
