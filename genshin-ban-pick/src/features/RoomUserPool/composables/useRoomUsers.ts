// src/features/RoomUserPool/composables/useRoomUsers.ts

import { ref, onMounted, onUnmounted } from 'vue';

import { useSocketStore } from '@/network/socket';

enum SocketEvent {
    ROOM_USER_JOIN_REQUEST = 'room.user.join.request',
    ROOM_USER_JOIN_BROADCAST = 'room.user.join.broadcast',

    ROOM_USER_LEAVE_REQUEST = 'room.user.leave.request',
    ROOM_USER_LEAVE_BROADCAST = 'room.user.leave.broadcast',

    ROOM_USERS_STATE_SYNC_ALL = 'room.users.state.sync.all',
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

    function handleUserJoinBroadcast(roomUser: IRoomUser) {
        console.log(`handleUserJoined roomUser: ${JSON.stringify(roomUser)}`);
    }

    function handleUserLeaveBroadcast(roomUser: IRoomUser) {
        console.log(`handleUserLeft roomUser: ${JSON.stringify(roomUser)}`);
    }

    function handleUsersStateSync(newRoomUsers: IRoomUser[]) {
        console.log(`handleUsersStateSynced roomUsers: ${JSON.stringify(newRoomUsers)}`);

        roomUsers.value = newRoomUsers;
    }

    onMounted(() => {
        console.log('[RoomUserPool] mounted, now listening...')
        socket.on(`${SocketEvent.ROOM_USER_JOIN_BROADCAST}`, handleUserJoinBroadcast);
        socket.on(`${SocketEvent.ROOM_USER_LEAVE_BROADCAST}`, handleUserLeaveBroadcast);
        socket.on(`${SocketEvent.ROOM_USERS_STATE_SYNC_ALL}`, handleUsersStateSync);
    });

    onUnmounted(() => {
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
