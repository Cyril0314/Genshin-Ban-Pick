// src/modules/auth/store/authStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

import { MemberRole } from '@shared/contracts/auth/value_type';
import { tokenStorage } from '../infrastructure/tokenStorage';

import type { Identity } from '../types/Identity';

export const useAuthStore = defineStore('auth', () => {
    const isInitialized = ref(false);
    const identity = ref<Identity | null>(null);
    const isLoggedIn = computed(() => identity.value !== null);
    const isAdmin = computed(() => identity.value?.type === 'Member' && identity.value.user.role === MemberRole.Admin);
    const isGuest = computed(() => identity.value?.type === 'Guest');
    const identityKey = computed(() => {
        if (!identity.value) return null;
        return `${identity.value.type}:${identity.value.user.id}`;
    });
    const nickname = computed(() => {
        if (!identity.value) return null;
        return identity.value.user.nickname;
    });

    watch(
        identity,
        (identity) => {
            console.debug('[AUTH STORE] Watch identity', identity);
        },
        { immediate: true },
    );

    function getToken() {
        return tokenStorage.get();
    }

    function setToken(token: string | null) {
        tokenStorage.set(token);
    }

    function setIdentity(newIdentity: Identity | null) {
        console.debug(`[AUTH STORE] Set Identity`, newIdentity);
        identity.value = newIdentity;
    }

    function setInitialized(value: boolean) {
        isInitialized.value = value;
    }

    return {
        identity,
        identityKey,
        nickname,
        isLoggedIn,
        isAdmin,
        isInitialized,
        setIdentity,
        setInitialized,
        getToken,
        setToken,
    };
});
