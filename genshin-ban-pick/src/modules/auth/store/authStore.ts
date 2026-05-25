// src/modules/auth/store/authStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

import { createLogger } from '@/app/utils/logger';
import { MemberRole } from '@shared/contracts/auth/value_types';
import { tokenStorage } from '../infrastructure/tokenStorage';

import type { Principal } from '@shared/contracts/auth/Principal';
import type { Identity } from '@shared/contracts/identity/Identity';

const logger = createLogger('auth.store');

export const useAuthStore = defineStore('auth', () => {
    const principal = ref<Principal>();
    const isLoggedIn = computed(() => principal.value !== undefined);
    const isAdmin = computed(() => principal.value?.type === 'Member' && principal.value.role === MemberRole.Admin);
    const identity = computed<Identity | undefined>(() => {
        if (!principal.value) return undefined;
        return principal.value;
    });

    watch(
        principal,
        (principal) => {
            logger.debug('watch principal', principal);
        },
        { immediate: true },
    );

    function getToken() {
        return tokenStorage.get();
    }

    function setToken(token: string | undefined) {
        tokenStorage.set(token);
    }

    function setPrincipal(newPrincipal: Principal | undefined) {
        logger.debug('set principal', newPrincipal);
        principal.value = newPrincipal;
    }

    return {
        principal,
        identity,
        isLoggedIn,
        isAdmin,
        setPrincipal,
        getToken,
        setToken,
    };
});
