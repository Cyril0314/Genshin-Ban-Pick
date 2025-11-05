// src/features/RoomUserPool/composables/useRoomUserSync.ts

import { storeToRefs } from 'pinia';

import { useSocketStore } from '@/stores/socketStore';
import { useRoomUserStore } from '@/stores/roomUserStore';

import type { IRoomUser } from '@/types/IRoomUser';

enum SocketEvent {
    ROOM_USER_JOIN_REQUEST = 'room.user.join.request',
    ROOM_USER_JOIN_BROADCAST = 'room.user.join.broadcast',

    ROOM_USER_LEAVE_REQUEST = 'room.user.leave.request',
    ROOM_USER_LEAVE_BROADCAST = 'room.user.leave.broadcast',

    ROOM_USERS_STATE_SYNC_ALL = 'room.users.state.sync.all',
}

export function useRoomUserSync() {
    const roomUserStore = useRoomUserStore();
    const { setRoomUsers } = roomUserStore
    const { roomUsers } = storeToRefs(roomUserStore)
    const socket = useSocketStore().getSocket();

    function registerRoomUserSync() {
        socket.on(`${SocketEvent.ROOM_USER_JOIN_BROADCAST}`, handleRoomUserJoinBroadcast);
        socket.on(`${SocketEvent.ROOM_USER_LEAVE_BROADCAST}`, handleRoomUserLeaveBroadcast);
        socket.on(`${SocketEvent.ROOM_USERS_STATE_SYNC_ALL}`, handleRoomUsersStateSync);
    }

    function joinRoom(roomId: string) {
        console.debug('[ROOM USERS] Sent room user join request', roomId)
        socket.emit(`${SocketEvent.ROOM_USER_JOIN_REQUEST}`, roomId);
    }

    function leaveRoom(roomId: string) {
        console.debug('[ROOM USERS] Sent room user leave request', roomId)
        socket.emit(`${SocketEvent.ROOM_USER_LEAVE_REQUEST}`, roomId);
    }

    function handleRoomUserJoinBroadcast(roomUser: IRoomUser) {
        console.debug('[ROOM USERS] Handle room user join broadcast', roomUser)
    }

    function handleRoomUserLeaveBroadcast(roomUser: IRoomUser) {
        console.debug('[ROOM USERS] Handle room user leave broadcast', roomUser)
    }

    function handleRoomUsersStateSync(newRoomUsers: IRoomUser[]) {
        console.debug('[ROOM USERS] Handle room users state sync', newRoomUsers)

        setRoomUsers(newRoomUsers)
    }

    return {
        roomUsers,
        registerRoomUserSync,
        joinRoom,
        leaveRoom,
    };
}
