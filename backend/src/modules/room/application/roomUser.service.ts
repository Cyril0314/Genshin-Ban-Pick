// src/backend/modules/room/application/roomUser.service.ts

import { createLogger } from '../../../utils/logger';
import { joinRoomUser } from '../domain/joinRoomUser';
import { leaveRoomUser } from '../domain/leaveRoomUser';

import type { Identity } from '@shared/contracts/identity/Identity';
import type { IRoomStateRepository } from '../domain/IRoomStateRepository';
import type UserService from '../../user/application/user.service';

const logger = createLogger('room.service.user');

export default class RoomUserService {
    constructor(
        private roomStateRepository: IRoomStateRepository,
        private userService: UserService,
    ) {}

    async join(roomId: string, identity: Identity, socketId: string) {
        const user = await this.userService.fetchUser(identity);
        const prevRoomUsers = this.roomStateRepository.findRoomUsersById(roomId);
        const { joinedUser, roomUsers } = joinRoomUser(prevRoomUsers, identity, user.nickname, socketId);

        this.roomStateRepository.updateRoomUsersById(roomId, roomUsers);

        return { joinedUser, roomUsers };
    }

    leave(roomId: string, identity: Identity) {
        const roomState = this.roomStateRepository.findById(roomId);
        if (!roomState) return { leavingUser: undefined, roomUsers: [] };

        const { leavingUser, roomUsers } = leaveRoomUser(roomState.users, identity)
        this.roomStateRepository.updateRoomUsersById(roomId, roomUsers)

        return { leavingUser, roomUsers };
    }
}
