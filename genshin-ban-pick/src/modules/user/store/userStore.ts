// src/modules/user/store/userStore.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { createLogger } from '@/app/utils/logger';

import type { User } from '@shared/contracts/user/User';

const logger = createLogger('user.store');

export const useUserStore = defineStore('user', () => {
    const user = ref<User>();
    const nickname = computed(() => user.value?.nickname);

    function setUser(newUser: User | undefined) {
        logger.debug('set user', newUser);
        user.value = newUser;
    }

    return { user, nickname, setUser };
});
