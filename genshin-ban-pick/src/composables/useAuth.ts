// src/composables/useAuth.ts

import { registerMember, loginMember, loginGuest, getAuthSession } from '@/network/authService';
import { useAuthStore, type Identity } from '@/stores/authStore';
import { TokenNotFound } from '@/errors/AppError';

export function useAuth() {
    const authStore = useAuthStore();
    const { setIdentity, removeIdentity, getToken, setToken } = authStore;

    function logout() {
        console.info(`[AUTH] Logout`);
        removeIdentity();
        setToken(null);
    }

    async function handleRegisterMember(payload: {
        account: string;
        password: string;
        nickname: string;
    }): Promise<{ identity: Identity; token: string }> {
        try {
            let response = await registerMember(payload);
            const newIdentity: Identity = { type: 'MEMBER', user: { ...response.data } };
            const token = response.data.token;
            setIdentity(newIdentity);
            setToken(token);
            return { identity: newIdentity, token };
        } catch (error: any) {
            throw error;
        }
    }

    async function handleLoginMember(payload: { account: string; password: string }): Promise<{ identity: Identity; token: string }> {
        try {
            const response = await loginMember(payload);
            const newIdentity: Identity = { type: 'MEMBER', user: { ...response.data } };
            const token = response.data.token;
            setIdentity(newIdentity);
            setToken(token);
            return { identity: newIdentity, token };
        } catch (error: any) {
            console.error(`[AUTH] Handle login member failed error:`, error);
            throw error;
        }
    }

    async function handleLoginGuest(): Promise<{ identity: Identity; token: string }> {
        try {
            const nickname = `guest_${Math.random().toString(36).slice(2, 8)}`;
            const response = await loginGuest({ nickname });
            const newIdentity: Identity = { type: 'GUEST', user: { ...response.data } };
            const token = response.data.token;
            setIdentity(newIdentity);
            setToken(token);
            return { identity: newIdentity, token };
        } catch (error) {
            console.error(`[AUTH] Handle login guest failed error:`, error);
            throw error;
        }
    }

    async function tryAutoLogin(): Promise<{ identity: Identity; token: string }> {
        const token = getToken();
        if (!token) {
            console.warn('[AUTH] Auto login failed, token is nil');
            throw new TokenNotFound();
        }

        try {
            const response = await getAuthSession();
            const newIdentity: Identity = { type: response.data.type, user: { ...response.data } };
            setIdentity(newIdentity);
            return { identity: newIdentity, token };
        } catch (error) {
            console.error(`[AUTH] Auto login failed error:`, error);
            throw error;
        }
    }

    return {
        handleRegisterMember,
        handleLoginMember,
        handleLoginGuest,
        tryAutoLogin,
        logout,
    };
}
