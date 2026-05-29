// src/modules/room/store/roomUserStore.ts

import { ref } from 'vue';
import { defineStore } from 'pinia';

import { createLogger } from '@/app/utils/logger';

const logger = createLogger('room.store');

import type { IRoomUser } from '@shared/contracts/room/IRoomUser';

export const useRoomUserStore = defineStore('roomUser', () => {
    const roomUsers = ref<IRoomUser[]>([]);

    function setRoomUsers(newRoomUsers: IRoomUser[]) {
        logger.debug('set room users', newRoomUsers);
        roomUsers.value = newRoomUsers;
    }

    return { roomUsers, setRoomUsers };
});
