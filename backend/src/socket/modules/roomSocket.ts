// backend/src/socket/modules/roomSocket.ts

import { Server, Socket } from 'socket.io';

import { syncBoardImageMapStateSelf } from './boardSocket.ts';
import { syncStepStateSelf } from './stepSocket.ts';
import { syncTeamMembersMapStateSelf, syncTeamMembersMapStateAll } from './teamSocket.ts';
import { createLogger } from '../../utils/logger.ts';
import { RoomStateManager } from '../managers/RoomStateManager.ts';

const logger = createLogger('ROOM SOCKET');

enum SocketEvent {
    ROOM_USER_JOIN_REQUEST = 'room.user.join.request',
    ROOM_USER_JOIN_BROADCAST = 'room.user.join.broadcast',

    ROOM_USER_LEAVE_REQUEST = 'room.user.leave.request',
    ROOM_USER_LEAVE_BROADCAST = 'room.user.leave.broadcast',

    ROOM_USERS_STATE_SYNC_ALL = 'room.users.state.sync.all',
}

export function registerRoomSocket(io: Server, socket: Socket, roomStateManager: RoomStateManager) {
    socket.on(SocketEvent.ROOM_USER_JOIN_REQUEST, (roomId: string) => {
        logger.info(`Received ${SocketEvent.ROOM_USER_JOIN_REQUEST} ${socket.id} roomId: ${roomId}`);
        socket.join(roomId);
        (socket as any).roomId = roomId;

        const nickname = socket.data.identity.nickname as string;
        const identityKey = socket.data.identity.identityKey as string;

        const roomUser = {
            id: socket.id,
            identityKey: identityKey,
            nickname: nickname,
            timestamp: Date.now(),
        };

        const roomState = roomStateManager.ensure(roomId);

        // 🔸 以 identityKey 檢查是否已存在
        const existingIndex = roomState.users.findIndex((u) => u.identityKey === identityKey);

        if (existingIndex >= 0) {
            // 使用者重連，更新 socketId & timestamp
            roomState.users[existingIndex].id = socket.id;
            roomState.users[existingIndex].timestamp = Date.now();
            logger.info(`${nickname} reconnected to room ${roomId}`);
        } else {
            // 新使用者加入
            roomState.users.push(roomUser);
            socket.to(roomId).emit(SocketEvent.ROOM_USER_JOIN_BROADCAST, roomUser);
            logger.info(`Sent ${SocketEvent.ROOM_USER_JOIN_BROADCAST} joinedUser:`, roomUser);
        }

        syncRoomUsersStateAll(io, roomId, roomStateManager);

        syncBoardImageMapStateSelf(socket, roomId, roomStateManager);
        syncStepStateSelf(socket, roomId, roomStateManager);
        syncTeamMembersMapStateSelf(socket, roomId, roomStateManager);
    });

    socket.on(SocketEvent.ROOM_USER_LEAVE_REQUEST, (roomId: string) => {
        logger.info(`Received ${SocketEvent.ROOM_USER_LEAVE_REQUEST} ${socket.id} roomId: ${roomId}`);
        handleRoomUserLeave(io, socket, roomId, roomStateManager);
    });
}

export function handleRoomUserLeave(io: Server, socket: Socket, roomId: string, roomStateManager: RoomStateManager) {
    socket.leave(roomId);
    const identityKey = socket.data.identity.identityKey as string;

    const roomState = roomStateManager.ensure(roomId);
    const leavingUser = roomState.users.find((u) => u.identityKey === identityKey);

    roomState.users = roomState.users.filter((u) => u.identityKey !== identityKey);

    delete (socket as any).roomId;

    if (leavingUser) {
        socket.to(roomId).emit(SocketEvent.ROOM_USER_LEAVE_BROADCAST, leavingUser);
        logger.info(`Sent ${SocketEvent.ROOM_USER_LEAVE_BROADCAST} leavingUser:`, leavingUser);
    }

    for (const [teamId, members] of Object.entries(roomState.teamMembersMap)) {
        roomState.teamMembersMap[Number(teamId)] = members.filter((m) => m.type !== 'ONLINE' || m.user.identityKey !== identityKey);
    }
    
    syncTeamMembersMapStateAll(io, roomId, roomStateManager);
    syncRoomUsersStateAll(io, roomId, roomStateManager);
}

function syncRoomUsersStateAll(io: Server, roomId: string, roomStateManager: RoomStateManager) {
    const roomUsers = roomStateManager.getUsers(roomId);
    io.to(roomId).emit(SocketEvent.ROOM_USERS_STATE_SYNC_ALL, roomUsers);
    logger.info(`Sent ${SocketEvent.ROOM_USERS_STATE_SYNC_ALL} roomUsers: ${JSON.stringify(roomUsers, null, 2)}`);
}

// 調用	                        A 是否收到	B 是否收到	C 是否收到	備註
// socket.emit(...)	               ✅     	 ❌	       ❌	 僅自己收到
// socket.to(roomId).emit(...)	   ❌	     ✅	       ✅	 除自己外所有人
// io.to(roomId).emit(...)	       ✅	     ✅	       ✅	 全房間都收到
