// src/features/RoomUserPool/composables/useRoomUsers.ts

import { ref, onMounted, onUnmounted } from 'vue';

import { useSocketStore } from '@/stores/socketStore';

import type { IRoomUser } from '@/types/IRoomUser';

enum SocketEvent {
    ROOM_USER_JOIN_REQUEST = 'room.user.join.request',
    ROOM_USER_JOIN_BROADCAST = 'room.user.join.broadcast',

    ROOM_USER_LEAVE_REQUEST = 'room.user.leave.request',
    ROOM_USER_LEAVE_BROADCAST = 'room.user.leave.broadcast',

    ROOM_USERS_STATE_SYNC_ALL = 'room.users.state.sync.all',
}

export function useRoomUsers() {
    const roomUsers = ref<IRoomUser[]>([]);
    const socket = useSocketStore().getSocket();

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

        roomUsers.value = newRoomUsers;
    }

    onMounted(() => {
        console.debug('[ROOM USERS] On mounted')
        socket.on(`${SocketEvent.ROOM_USER_JOIN_BROADCAST}`, handleRoomUserJoinBroadcast);
        socket.on(`${SocketEvent.ROOM_USER_LEAVE_BROADCAST}`, handleRoomUserLeaveBroadcast);
        socket.on(`${SocketEvent.ROOM_USERS_STATE_SYNC_ALL}`, handleRoomUsersStateSync);
    });

    onUnmounted(() => {
        console.debug('[ROOM USERS] On unmounted')
        socket.off(`${SocketEvent.ROOM_USER_JOIN_BROADCAST}`);
        socket.off(`${SocketEvent.ROOM_USER_LEAVE_BROADCAST}`);
        socket.off(`${SocketEvent.ROOM_USERS_STATE_SYNC_ALL}`);
    });

    return {
        roomUsers,
        joinRoom,
        leaveRoom,
    };
}
