// src/stores/authStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';

import { MemberRole, type IMember } from '@/types/IMember';
import type { IGuest } from '@/types/IGuest';

export type Identity = { type: 'Member'; user: IMember } | { type: 'Guest'; user: IGuest }
export type MaybeIdentity = Identity | null

export const useAuthStore = defineStore('auth', () => {
    const identity = ref<MaybeIdentity>(null);
    const isLoggedIn = computed(() => identity.value !== null);
    const isAdmin = computed(() => identity.value?.type === 'Member' && identity.value.user.role === MemberRole.Admin );
    const isGuest = computed(() => identity.value?.type === 'Guest');
    const identityKey = computed(() => {
        if (!identity.value) return null;
        return `${identity.value.type}:${identity.value.user.id}`;
    });
    const nickname = computed(() => {
        if (!identity.value) return null;
        return identity.value.user.nickname;
    });

    watch(identity, (identity) => {
        console.debug('[AUTH STORE] Watch identity', identity)
    }, { immediate: true })


    function getToken() {
        let token = localStorage.getItem('auth_token')
        console.debug(`[AUTH STORE] Get access token`, token)
        return token
    }

    function setToken(authToken: string | null) {
        console.debug(`[AUTH STORE] Set access token`, authToken)
        if (authToken === null) {
            localStorage.removeItem('auth_token');
            return
        }
        localStorage.setItem('auth_token', authToken);
    }

    function setIdentity(newIdentity: Identity) {
        console.debug(`[AUTH STORE] Set Identity`, newIdentity)
        identity.value = newIdentity;
    }

    function removeIdentity() {
        identity.value = null;
    }

    return {
        identity,
        identityKey,
        nickname,
        isLoggedIn,
        isAdmin,
        setIdentity,
        removeIdentity,
        getToken,
        setToken,
    };
});
