// backend/src/modules/socket/modules/roomSocket.ts

import { Server, Socket } from 'socket.io';

import { syncBoardImageMapStateSelf } from './boardSocket.ts';
import { syncStepStateSelf } from './stepSocket.ts';
import { syncTeamMembersMapStateSelf, syncTeamMembersMapStateAll } from './teamSocket.ts';
import { createLogger } from '../../../utils/logger.ts';
import { IRoomStateManager } from '../managers/IRoomStateManager.ts';
import { syncChatMessagesStateSelf } from './chatSocket.ts';
import { syncTacticalCellImageMapStateSelf } from './tacticalSocket.ts';
import { IRoomUser, RoomUserService } from '../../room/index.ts';

const logger = createLogger('ROOM SOCKET');

enum RoomEvent {
    UserJoinRequest = 'room.user.join.request',
    UserJoinBroadcast = 'room.user.join.broadcast',

    UserLeaveRequest = 'room.user.leave.request',
    UserLeaveBroadcast = 'room.user.leave.broadcast',

    UsersStateSyncAll = 'room.users.state.sync.all',
}

export function registerRoomSocket(io: Server, socket: Socket, roomUserService: RoomUserService, roomStateManager: IRoomStateManager) {
    socket.on(RoomEvent.UserJoinRequest, (roomId: string) => {
        logger.info(`Received ${RoomEvent.UserJoinRequest} ${socket.id} roomId: ${roomId}`);
        socket.join(roomId);
        (socket as any).roomId = roomId;

        const nickname = socket.data.identity.nickname as string;
        const identityKey = socket.data.identity.identityKey as string;

        const { joinedUser, isReconnect, roomUsers, userTeamSlot } = roomUserService.join(roomId, { identityKey, nickname, socketId: socket.id })

        if (!isReconnect) {
            socket.to(roomId).emit(RoomEvent.UserJoinBroadcast, joinedUser);
            logger.info(`Sent ${RoomEvent.UserJoinBroadcast} joinedUser:`, joinedUser);
        }

        syncRoomUsersStateAll(io, roomId, roomUsers);

        syncBoardImageMapStateSelf(socket, roomId, roomStateManager);
        syncStepStateSelf(socket, roomId, roomStateManager);
        syncTeamMembersMapStateSelf(socket, roomId, roomStateManager);
        syncChatMessagesStateSelf(socket, roomId, roomStateManager);
        syncTacticalCellImageMapStateSelf(socket, roomId, roomStateManager, Number(userTeamSlot));
    });

    socket.on(RoomEvent.UserLeaveRequest, (roomId: string) => {
        logger.info(`Received ${RoomEvent.UserLeaveRequest} ${socket.id} roomId: ${roomId}`);
        handleRoomUserLeave(io, socket, roomId, roomUserService);
    });
}

export function handleRoomUserLeave(io: Server, socket: Socket, roomId: string, roomUserService: RoomUserService) {
    socket.leave(roomId);
    const identityKey = socket.data.identity.identityKey as string;

    const { leavingUser, roomUsers } = roomUserService.leave(roomId, identityKey)

    delete (socket as any).roomId;

    if (leavingUser) {
        socket.to(roomId).emit(RoomEvent.UserLeaveBroadcast, leavingUser);
        logger.info(`Sent ${RoomEvent.UserLeaveBroadcast} leavingUser:`, leavingUser);
    }

    syncRoomUsersStateAll(io, roomId, roomUsers);
}

function syncRoomUsersStateAll(io: Server, roomId: string, roomUsers: IRoomUser[]) {
    io.to(roomId).emit(RoomEvent.UsersStateSyncAll, roomUsers);
    logger.info(`Sent ${RoomEvent.UsersStateSyncAll} roomUsers: ${JSON.stringify(roomUsers, null, 2)}`);
}

// 調用	                        A 是否收到	B 是否收到	C 是否收到	備註
// socket.emit(...)	               ✅     	 ❌	       ❌	 僅自己收到
// socket.to(roomId).emit(...)	   ❌	     ✅	       ✅	 除自己外所有人
// io.to(roomId).emit(...)	       ✅	     ✅	       ✅	 全房間都收到
