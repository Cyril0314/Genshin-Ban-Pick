// src/features/RoomUserPool/composables/useRoomUsers.ts

import { ref, onMounted, onUnmounted } from 'vue';

import { useSocketStore } from '@/network/socket';

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

export function useRoomUsers() {
    const roomUsers = ref<IRoomUser[]>([]);
    const socket = useSocketStore().getSocket();

    function joinRoom(roomId: string) {
        console.log(`[Client] join room ${roomId}`)
        socket.emit(`${SocketEvent.ROOM_USER_JOIN_REQUEST}`, roomId);
    }

    function leaveRoom(roomId: string) {
        console.log(`[Client] leave room ${roomId}`)
        socket.emit(`${SocketEvent.ROOM_USER_LEAVE_REQUEST}`, roomId);
    }

    function handleUserJoined(roomUser: IRoomUser) {
        console.log(`handleUserJoined roomUser: ${JSON.stringify(roomUser)}`);
    }

    function handleUserLeft(roomUser: IRoomUser) {
        console.log(`handleUserLeft roomUser: ${JSON.stringify(roomUser)}`);
    }

    function handleUsersUpdated(newRoomUsers: IRoomUser[]) {
        console.log(`handleUsersUpdated roomUsers: ${JSON.stringify(newRoomUsers)}`);

        roomUsers.value = newRoomUsers;
    }

    onMounted(() => {
        console.log('[RoomUserPool] mounted, now listening...')
        socket.on(`${SocketEvent.ROOM_USER_JOIN_BROADCAST}`, handleUserJoined);
        socket.on(`${SocketEvent.ROOM_USER_LEAVE_BROADCAST}`, handleUserLeft);
        socket.on(`${SocketEvent.ROOM_USERS_UPDATE_BROADCAST}`, handleUsersUpdated);
    });

    onUnmounted(() => {
        socket.off(`${SocketEvent.ROOM_USER_JOIN_BROADCAST}`, handleUserJoined);
        socket.off(`${SocketEvent.ROOM_USER_LEAVE_BROADCAST}`, handleUserLeft);
        socket.off(`${SocketEvent.ROOM_USERS_UPDATE_BROADCAST}`, handleUsersUpdated);
    });

    return {
        roomUsers,
        joinRoom,
        leaveRoom,
    };
}
