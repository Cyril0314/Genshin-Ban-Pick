// backend/src/modules/socket/modules/roomSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger';

import { RoomUserService } from '../../room';
import { RoomEvent } from '@shared/contracts/room/value-types';

import type { IRoomUser } from '@shared/contracts/room/IRoomUser';

const logger = createLogger('ROOM SOCKET');

export function registerRoomSocket(io: Server, socket: Socket, roomUserService: RoomUserService) {
    socket.on(RoomEvent.UserJoinRequest, (roomId: string) => {
        logger.info(`Received ${RoomEvent.UserJoinRequest} ${socket.id} roomId: ${roomId}`);
        socket.join(roomId);
        (socket as any).roomId = roomId;

        const nickname = socket.data.identity.nickname as string;
        const identityKey = socket.data.identity.identityKey as string;

        const { joinedUser, roomUsers } = roomUserService.join(roomId, { identityKey, nickname, socketId: socket.id });

        if (joinedUser) {
            socket.to(roomId).emit(RoomEvent.UserJoinBroadcast, joinedUser);
            logger.info(`Sent ${RoomEvent.UserJoinBroadcast} joinedUser:`, joinedUser);
        }

        socket.emit(RoomEvent.UserJoinResponse, joinedUser);

        syncRoomUsersStateAll(roomId, roomUsers);
    });

    socket.on(RoomEvent.UserLeaveRequest, (roomId: string) => {
        logger.info(`Received ${RoomEvent.UserLeaveRequest} ${socket.id} roomId: ${roomId}`);
        handleRoomUserLeave(roomId, roomUserService);
    });

    socket.on('disconnect', (reason) => {
        const roomId = (socket as any).roomId;
        if (!roomId) return;
        logger.info(`Received disconnect ${socket.id} roomId: ${roomId}`, reason);
        handleRoomUserLeave(roomId, roomUserService);
    });

    function handleRoomUserLeave(roomId: string, roomUserService: RoomUserService) {
        socket.leave(roomId);
        const identityKey = socket.data.identity.identityKey as string;

        const { leavingUser, roomUsers } = roomUserService.leave(roomId, identityKey);

        delete (socket as any).roomId;

        if (leavingUser) {
            socket.to(roomId).emit(RoomEvent.UserLeaveBroadcast, leavingUser);
            logger.info(`Sent ${RoomEvent.UserLeaveBroadcast} leavingUser:`, leavingUser);
        }

        syncRoomUsersStateAll(roomId, roomUsers);
    }

    function syncRoomUsersStateAll(roomId: string, roomUsers: IRoomUser[]) {
        io.to(roomId).emit(RoomEvent.UsersStateSyncAll, roomUsers);
        logger.info(`Sent ${RoomEvent.UsersStateSyncAll} roomUsers: ${JSON.stringify(roomUsers, null, 2)}`);
    }
}
