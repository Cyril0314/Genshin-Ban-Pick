// src/stores/roomUserStore.ts

import { ref } from 'vue';
import { defineStore } from 'pinia';

import type { IRoomUser } from '@/types/IRoomUser';

export const useRoomUserStore = defineStore('roomUser', () => {
    const roomUsers = ref<IRoomUser[]>([]);

    function setRoomUsers(newRoomUsers: IRoomUser[]) {
        console.debug(`[TEAM INFO STORE] Set room users`, newRoomUsers);
        roomUsers.value = newRoomUsers;
    }

    return { roomUsers, setRoomUsers };
});
