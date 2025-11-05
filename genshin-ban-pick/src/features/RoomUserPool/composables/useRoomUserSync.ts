// src/features/RoomUserPool/composables/useRoomUserSync.ts

import { storeToRefs } from 'pinia';

import { useSocketStore } from '@/stores/socketStore';
import { useRoomUserStore } from '@/stores/roomUserStore';

import type { IRoomUser } from '@/types/IRoomUser';

enum RoomEvent {
    UserJoinRequest = 'room.user.join.request',
    UserJoinBroadcast = 'room.user.join.broadcast',

    UserLeaveRequest = 'room.user.leave.request',
    UserLeaveBroadcast = 'room.user.leave.broadcast',

    UsersStateSyncAll = 'room.users.state.sync.all',
}

export function useRoomUserSync() {
    const roomUserStore = useRoomUserStore();
    const { setRoomUsers } = roomUserStore
    const { roomUsers } = storeToRefs(roomUserStore)
    const socket = useSocketStore().getSocket();

    function registerRoomUserSync() {
        socket.on(`${RoomEvent.UserJoinBroadcast}`, handleRoomUserJoinBroadcast);
        socket.on(`${RoomEvent.UserLeaveBroadcast}`, handleRoomUserLeaveBroadcast);
        socket.on(`${RoomEvent.UsersStateSyncAll}`, handleRoomUsersStateSync);
    }

    function joinRoom(roomId: string) {
        console.debug('[ROOM USERS] Sent room user join request', roomId)
        socket.emit(`${RoomEvent.UserJoinRequest}`, roomId);
    }

    function leaveRoom(roomId: string) {
        console.debug('[ROOM USERS] Sent room user leave request', roomId)
        socket.emit(`${RoomEvent.UserLeaveRequest}`, roomId);
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
