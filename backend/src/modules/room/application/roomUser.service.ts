// src/backend/modules/room/application/roomUser.service.ts

import { findUserTeamSlot } from '../domain/findUserTeamSlot.ts';
import { IRoomStateRepository } from '../domain/IRoomStateRepository.ts';
import { joinRoomUser } from '../domain/joinRoomUser.ts';
import { leaveRoomUser } from '../domain/leaveRoomUser.ts';

export default class RoomUserService {
    constructor(private roomStateRepository: IRoomStateRepository) {}

    join(roomId: string, identity: { identityKey: string; nickname: string; socketId: string }) {
        const roomState = this.roomStateRepository.get(roomId);
        if (!roomState) throw new Error('Room not found');

        const {joinedUser, isReconnect, roomUsers } = joinRoomUser(roomState.users, identity)

        this.roomStateRepository.setRoomUsers(roomId, roomUsers)

        const userTeamSlot = findUserTeamSlot(roomState.teamMembersMap, identity.identityKey)

        return { joinedUser, isReconnect, roomUsers, userTeamSlot }
    }

    leave(roomId: string, identityKey: string) {
        const roomState = this.roomStateRepository.get(roomId);
        if (!roomState) return { leavingUser: null, roomUsers: [] };

        const { leavingUser, roomUsers } = leaveRoomUser(roomState.users, identityKey)

        return { leavingUser, roomUsers };
    }
}
