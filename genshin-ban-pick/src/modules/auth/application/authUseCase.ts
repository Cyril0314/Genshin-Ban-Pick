// src/modules/auth/application/authUseCase.ts

import { registerMemberDomain } from '../domain/registerMemberDomain';
import { loginMemberDomain } from '../domain/loginMemberDomain';
import { loginGuestDomain } from '../domain/loginGuestDomain';
import { autoLoginDomain } from '../domain/autoLoginDomain';
import { useAuthStore } from '../store/authStore';

export function authUseCase() {
    const authStore = useAuthStore();

    async function registerMember(account: string, password: string, nickname: string) {
        const { identity, token } = await registerMemberDomain({ account, password, nickname });
        authStore.setIdentity(identity);
        authStore.setToken(token);
        return { identity, token };
    }

    async function loginMember(account: string, password: string) {
        const { identity, token } = await loginMemberDomain({ account, password });
        authStore.setIdentity(identity);
        authStore.setToken(token);
        return { identity, token };
    }

    async function loginGuest() {
        const { identity, token } = await loginGuestDomain();
        authStore.setIdentity(identity);
        authStore.setToken(token);
        return { identity, token };
    }

    async function autoLogin() {
        if (authStore.isInitialized) {
            const token = authStore.getToken();
            const identity = authStore.identity;
            return { identity, token };
        }

        const token = authStore.getToken();
        if (!token) {
            authStore.setInitialized(true);
            return { identity: null, token: null };
        }

        try {
            const identity = await autoLoginDomain(token);
            authStore.setIdentity(identity);
            return { identity, token };
        } catch (error) {
            authStore.setToken(null);
            authStore.setIdentity(null);
            return { identity: null, token: null };
        } finally {
            authStore.setInitialized(true);
        }
    }

    function logout() {
        authStore.setIdentity(null);
        authStore.setToken(null);
    }

    return {
        registerMember,
        loginMember,
        loginGuest,
        autoLogin,
        logout,
    };
}
