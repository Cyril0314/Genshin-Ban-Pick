// backend/src/socket/modules/roomSocket.ts

import { Server, Socket } from 'socket.io';

import { syncBoardImageMapStateSelf } from './boardSocket.ts';
import { syncStepStateSelf } from './stepSocket.ts';
import { syncTeamMembersMapStateSelf, syncTeamMembersMapStateAll } from './teamSocket.ts';
import { createLogger } from '../../utils/logger.ts';
import { RoomStateManager } from '../managers/RoomStateManager.ts';
import { IRoomStateManager } from '../managers/IRoomStateManager.ts';
import { syncChatMessagesStateSelf } from './chatSocket.ts';
import { syncTacticalCellImageMapStateSelf } from './tacticalSocket.ts';

const logger = createLogger('ROOM SOCKET');

enum RoomEvent {
    UserJoinRequest = 'room.user.join.request',
    UserJoinBroadcast = 'room.user.join.broadcast',

    UserLeaveRequest = 'room.user.leave.request',
    UserLeaveBroadcast = 'room.user.leave.broadcast',

    UsersStateSyncAll = 'room.users.state.sync.all',
}

export function registerRoomSocket(io: Server, socket: Socket, roomStateManager: IRoomStateManager) {
    socket.on(RoomEvent.UserJoinRequest, (roomId: string) => {
        logger.info(`Received ${RoomEvent.UserJoinRequest} ${socket.id} roomId: ${roomId}`);
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
            socket.to(roomId).emit(RoomEvent.UserJoinBroadcast, roomUser);
            logger.info(`Sent ${RoomEvent.UserJoinBroadcast} joinedUser:`, roomUser);
        }

        const userTeamSlot = Object.entries(roomState.teamMembersMap).find(([teamSlot, members]) => {
            if (members.some((m) => m.type === 'Online' && m.user.identityKey === identityKey)) {
                return true;
            } else {
                return false
            }
        })?.[0]

        syncRoomUsersStateAll(io, roomId, roomStateManager);

        syncBoardImageMapStateSelf(socket, roomId, roomStateManager);
        syncStepStateSelf(socket, roomId, roomStateManager);
        syncTeamMembersMapStateSelf(socket, roomId, roomStateManager);
        syncChatMessagesStateSelf(socket, roomId, roomStateManager)
        syncTacticalCellImageMapStateSelf(socket, roomId, roomStateManager, Number(userTeamSlot))
    });

    socket.on(RoomEvent.UserLeaveRequest, (roomId: string) => {
        logger.info(`Received ${RoomEvent.UserLeaveRequest} ${socket.id} roomId: ${roomId}`);
        handleRoomUserLeave(io, socket, roomId, roomStateManager);
    });
}

export function handleRoomUserLeave(io: Server, socket: Socket, roomId: string, roomStateManager: IRoomStateManager) {
    socket.leave(roomId);
    const identityKey = socket.data.identity.identityKey as string;

    const roomState = roomStateManager.ensure(roomId);
    const leavingUser = roomState.users.find((u) => u.identityKey === identityKey);

    roomState.users = roomState.users.filter((u) => u.identityKey !== identityKey);

    delete (socket as any).roomId;

    if (leavingUser) {
        socket.to(roomId).emit(RoomEvent.UserLeaveBroadcast, leavingUser);
        logger.info(`Sent ${RoomEvent.UserLeaveBroadcast} leavingUser:`, leavingUser);
    }

    for (const [teamSlot, members] of Object.entries(roomState.teamMembersMap)) {
        roomState.teamMembersMap[Number(teamSlot)] = members.filter((m) => m.type !== 'Online' || m.user.identityKey !== identityKey);
    }
    
    syncTeamMembersMapStateAll(io, roomId, roomStateManager);
    syncRoomUsersStateAll(io, roomId, roomStateManager);
}

function syncRoomUsersStateAll(io: Server, roomId: string, roomStateManager: IRoomStateManager) {
    const roomUsers = roomStateManager.getUsers(roomId);
    io.to(roomId).emit(RoomEvent.UsersStateSyncAll, roomUsers);
    logger.info(`Sent ${RoomEvent.UsersStateSyncAll} roomUsers: ${JSON.stringify(roomUsers, null, 2)}`);
}

// 調用	                        A 是否收到	B 是否收到	C 是否收到	備註
// socket.emit(...)	               ✅     	 ❌	       ❌	 僅自己收到
// socket.to(roomId).emit(...)	   ❌	     ✅	       ✅	 除自己外所有人
// io.to(roomId).emit(...)	       ✅	     ✅	       ✅	 全房間都收到
