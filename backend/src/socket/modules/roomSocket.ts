// backend/src/socket/modules/roomSocket.ts

import { Server, Socket } from 'socket.io';

import { syncChatState } from './chatSocket.ts';
import { syncImageState } from './imageSocket.ts';
import { syncStepState } from './stepSocket.ts';
import { syncTeamState } from './teamSocket.ts';

interface RoomUser {
    id: string;
    identityKey: string;
    nickname: string;
    timestamp: number;
    team: 'aether' | 'lumine' | null;
}

const roomUsersState: Record<string, RoomUser[]> = {};

export function registerRoomSocket(io: Server, socket: Socket) {
    socket.on('room.user.join.request', (roomId: string) => {
        console.log(`[Server] ${socket.id} joined room: ${roomId}`);
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
            console.log(`[Room] ${nickname} reconnected to room ${roomId}`);
        } else {
            // 新使用者加入
            roomUsersState[roomId].push(roomUser);
            console.log(`[Room] ${nickname} joined room ${roomId}`);
            socket.to(roomId).emit('room.user.join.broadcast', roomUser);
        }

        io.to(roomId).emit('room.users.update.broadcast', roomUsersState[roomId]);

        syncImageState(socket, roomId);
        syncStepState(socket, roomId);
        syncTeamState(socket, roomId);
        syncChatState(socket, roomId);
    });

    socket.on('room.user.leave.request', (roomId: string) => {
        socket.leave(roomId);
        console.log(`[Socket] ${socket.id} left ${roomId}`);

        const identityKey = socket.data.identityKey;

        const roomUsers = roomUsersState[roomId] || [];
        const leavingUser = roomUsers.find((u) => u.identityKey === identityKey);

        roomUsersState[roomId] = roomUsers.filter((u) => u.identityKey !== identityKey);

        delete (socket as any).roomId;

        if (leavingUser) {
            console.log(`${JSON.stringify(leavingUser)}`);
            io.to(roomId).emit('room.user.leave.broadcast', leavingUser);
        }

        io.to(roomId).emit('room.users.update.broadcast', roomUsersState[roomId]);
    });
}
