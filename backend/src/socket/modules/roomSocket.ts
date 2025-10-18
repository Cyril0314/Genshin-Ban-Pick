// backend/src/socket/modules/roomSocket.ts

import { Server, Socket } from 'socket.io';

import { syncChatState } from './chatSocket.ts';
import { syncBoardState } from './boardSocket.ts';
import { syncStepState } from './stepSocket.ts';
import { syncTeamState } from './teamSocket.ts';
import { logger } from '../../utils/logger.ts';

enum SocketEvent {
    ROOM_USER_JOIN_REQUEST = 'room.user.join.request',
    ROOM_USER_JOIN_BROADCAST = 'room.user.join.broadcast',

    ROOM_USER_LEAVE_REQUEST = 'room.user.leave.request',
    ROOM_USER_LEAVE_BROADCAST = 'room.user.leave.broadcast',

    ROOM_USERS_UPDATE_BROADCAST = 'room.users.update.broadcast',
    ROOM_USERS_STATE_SYNC = 'room.users.state.sync',
}

interface IRoomUser {
    id: string;
    identityKey: string;
    nickname: string;
    timestamp: number;
    teamId?: number;
}

type RoomId = string;

const roomUsersState: Record<RoomId, IRoomUser[]> = {};

export function registerRoomSocket(io: Server, socket: Socket) {
    socket.on(SocketEvent.ROOM_USER_JOIN_REQUEST, (roomId: RoomId) => {
        logger.info(`Received ${SocketEvent.ROOM_USER_JOIN_REQUEST} ${socket.id} roomId: ${roomId}`);
        socket.join(roomId);
        (socket as any).roomId = roomId;

        const nickname = socket.data.nickname as string;
        const identityKey = socket.data.identityKey;

        const roomUser = {
            id: socket.id,
            identityKey: identityKey,
            nickname: nickname,
            timestamp: Date.now(),
            team: null,
        };

        roomUsersState[roomId] ||= [];

        // 🔸 以 identityKey 檢查是否已存在
        const existingIndex = roomUsersState[roomId].findIndex((u) => u.identityKey === identityKey);

        if (existingIndex >= 0) {
            // 使用者重連，更新 socketId & timestamp
            roomUsersState[roomId][existingIndex].id = socket.id;
            roomUsersState[roomId][existingIndex].timestamp = Date.now();
            logger.info(`${nickname} reconnected to room ${roomId}`);
        } else {
            // 新使用者加入
            roomUsersState[roomId].push(roomUser);
            socket.to(roomId).emit(SocketEvent.ROOM_USER_JOIN_BROADCAST, roomUser);
            logger.info(`Sent ${SocketEvent.ROOM_USER_JOIN_BROADCAST} joinedUser: ${JSON.stringify(roomUser, null, 2)}`);
        }

        updateRoomUsers(io, roomId);

        syncBoardState(socket, roomId);
        syncStepState(socket, roomId);
        syncTeamState(socket, roomId);
        syncChatState(socket, roomId);
    });

    socket.on(SocketEvent.ROOM_USER_LEAVE_REQUEST, (roomId: RoomId) => {
        logger.info(`Received ${SocketEvent.ROOM_USER_LEAVE_REQUEST} ${socket.id} roomId: ${roomId}`);
        socket.leave(roomId);

        const identityKey = socket.data.identityKey;

        const roomUsers = roomUsersState[roomId] || [];
        const leavingUser = roomUsers.find((u) => u.identityKey === identityKey);

        roomUsersState[roomId] = roomUsers.filter((u) => u.identityKey !== identityKey);

        delete (socket as any).roomId;

        if (leavingUser) {
            socket.to(roomId).emit(SocketEvent.ROOM_USER_LEAVE_BROADCAST, leavingUser);
            logger.info(`Sent ${SocketEvent.ROOM_USER_LEAVE_BROADCAST} leavingUser: ${JSON.stringify(leavingUser, null, 2)}`);
        }

        updateRoomUsers(io, roomId);
    });

    function updateRoomUsers(io: Server, roomId: RoomId) {
        const roomUsers = roomUsersState[roomId] || [];
        io.to(roomId).emit(SocketEvent.ROOM_USERS_UPDATE_BROADCAST, roomUsers);
        logger.info(`Sent ${SocketEvent.ROOM_USERS_UPDATE_BROADCAST} roomUsers: ${JSON.stringify(roomUsers, null, 2)}`);
    }

    function syncRoomState(socket: Socket, roomId: RoomId) {
        const roomUsers = roomUsersState[roomId] || [];
        socket.emit(SocketEvent.ROOM_USERS_STATE_SYNC, roomUsers);
        logger.info(`Sent ${SocketEvent.ROOM_USERS_STATE_SYNC} roomUsers: ${JSON.stringify(roomUsers, null, 2)}`);
    }
}

// 調用	                        A 是否收到	B 是否收到	C 是否收到	備註
// socket.emit(...)	               ✅     	 ❌	       ❌	 僅自己收到
// socket.to(roomId).emit(...)	   ❌	     ✅	       ✅	 除自己外所有人
// io.to(roomId).emit(...)	       ✅	     ✅	       ✅	 全房間都收到