// backend/src/modules/socket/modules/roomSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger';

import { RoomUserService } from '../../room';
import { RoomEvent } from '@shared/contracts/room/value-types';

import type { Identity } from '@shared/contracts/identity/Identity';
import type { IRoomUser } from '@shared/contracts/room/IRoomUser';

const logger = createLogger('socket.room');

export function registerRoomSocket(io: Server, socket: Socket, roomUserService: RoomUserService) {
    socket.on(RoomEvent.UserJoinRequest, async (roomId: string) => {
        logger.debug(`Received ${RoomEvent.UserJoinRequest} ${socket.id} roomId: ${roomId}`);
        socket.join(roomId);
        (socket as any).roomId = roomId;

        const identity = socket.data.identity as Identity;
        const { joinedUser, roomUsers } = await roomUserService.join(roomId, identity, socket.id);

        if (joinedUser) {
            socket.to(roomId).emit(RoomEvent.UserJoinBroadcast, joinedUser);
            logger.debug(`Sent ${RoomEvent.UserJoinBroadcast} joinedUser:`, joinedUser);
        }

        socket.emit(RoomEvent.UserJoinResponse, joinedUser);

        syncRoomUsersStateAll(roomId, roomUsers);
    });

    socket.on(RoomEvent.UserLeaveRequest, (roomId: string) => {
        logger.debug(`Received ${RoomEvent.UserLeaveRequest} ${socket.id} roomId: ${roomId}`);
        handleRoomUserLeave(roomId, roomUserService);
    });

    socket.on('disconnect', (reason) => {
        const roomId = (socket as any).roomId;
        if (!roomId) return;
        logger.debug(`Received disconnect ${socket.id} roomId: ${roomId}`, reason);
        handleRoomUserLeave(roomId, roomUserService);
    });

    function handleRoomUserLeave(roomId: string, roomUserService: RoomUserService) {
        socket.leave(roomId);
        const identity = socket.data.identity as Identity;

        const { leavingUser, roomUsers } = roomUserService.leave(roomId, identity);

        delete (socket as any).roomId;

        if (leavingUser) {
            socket.to(roomId).emit(RoomEvent.UserLeaveBroadcast, leavingUser);
            logger.debug(`Sent ${RoomEvent.UserLeaveBroadcast} leavingUser:`, leavingUser);
        }

        syncRoomUsersStateAll(roomId, roomUsers);
    }

    function syncRoomUsersStateAll(roomId: string, roomUsers: IRoomUser[]) {
        io.to(roomId).emit(RoomEvent.UsersStateSyncAll, roomUsers);
        logger.debug(`Sent ${RoomEvent.UsersStateSyncAll} roomUsers:`, roomUsers);
    }
}
