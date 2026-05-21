// src/modules/auth/store/authStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

import { createLogger } from '@/app/utils/logger';
import { MemberRole } from '@shared/contracts/auth/value_types';
import { tokenStorage } from '../infrastructure/tokenStorage';

import type { AuthUser } from '@shared/contracts/auth/AuthUser';
import type { Identity } from '@shared/contracts/identity/Identity';

const logger = createLogger('auth.store');

export const useAuthStore = defineStore('auth', () => {
    const isInitialized = ref(false);
    const authUser = ref<AuthUser>();
    const isLoggedIn = computed(() => authUser.value !== undefined);
    const isAdmin = computed(() => authUser.value?.type === 'Member' && authUser.value.role === MemberRole.Admin);
    const isGuest = computed(() => authUser.value?.type === 'Guest');
    // lean { type, id } for cross-module comparisons (e.g. isSameIdentity); use authUser for display fields
    const identity = computed<Identity | undefined>(() => {
        if (!authUser.value) return undefined;
        return authUser.value;
    });
    const nickname = computed(() => {
        if (!authUser.value) return undefined;
        return authUser.value.nickname;
    });

    watch(
        authUser,
        (authUser) => {
            logger.debug('watch authUser', authUser);
        },
        { immediate: true },
    );

    function getToken() {
        return tokenStorage.get();
    }

    function setToken(token: string | undefined) {
        tokenStorage.set(token);
    }

    function setAuthUser(newAuthUser: AuthUser | undefined) {
        logger.debug('set authUser', newAuthUser);
        authUser.value = newAuthUser;
    }

    function setInitialized(value: boolean) {
        isInitialized.value = value;
    }

    return {
        authUser,
        identity,
        nickname,
        isLoggedIn,
        isAdmin,
        isInitialized,
        setAuthUser,
        setInitialized,
        getToken,
        setToken,
    };
});
