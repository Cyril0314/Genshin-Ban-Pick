// src/features/RoomUserPool/composables/useRoomUsers.ts

import { ref, onMounted, onUnmounted } from 'vue';

import { useSocketStore } from '@/network/socket';

const roomUsers = ref<IRoomUser[]>([]);

export function useRoomUsers() {
    const socket = useSocketStore().getSocket();

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
        socket.on('room.user.join.broadcast', handleUserJoined);
        socket.on('room.user.leave.broadcast', handleUserLeft);
        socket.on('room.users.update.broadcast', handleUsersUpdated);
    });

    onUnmounted(() => {
        socket.off('room.user.join.broadcast', handleUserJoined);
        socket.off('room.user.leave.broadcast', handleUserLeft);
        socket.off('room.users.update.broadcast', handleUsersUpdated);
    });

    return {
        roomUsers,
    };
}

interface IRoomUser {
    id: string;
    identityKey: string;
    nickname: string;
    timestamp: number;
    team: 'aether' | 'lumine' | null;
}
