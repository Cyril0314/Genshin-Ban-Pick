// src/app/composables/useSession.ts

import { createLogger } from '@/app/utils/logger';
import { useSocketStore } from '@/app/stores/socketStore';
import { useAuthStore, useAuthUseCase } from '@/modules/auth';
import { useUserUseCase } from '@/modules/user';

const logger = createLogger('app.session');

export function useSession() {
    const authUseCase = useAuthUseCase();
    const userUseCase = useUserUseCase();
    const authStore = useAuthStore();
    const socketStore = useSocketStore();

    async function connectAndFetchProfile(): Promise<void> {
        const token = authStore.getToken();
        if (!token) {
            logger.debug('no token after auth — skip socket connect + profile fetch');
            return;
        }
        socketStore.connect(token);
        await userUseCase.fetchProfile();
    }

    async function loginMember(account: string, password: string): Promise<void> {
        await authUseCase.loginMember(account, password);
        await connectAndFetchProfile();
    }

    async function loginGuest(): Promise<void> {
        await authUseCase.loginGuest();
        await connectAndFetchProfile();
    }

    async function registerMember(account: string, password: string, nickname: string): Promise<void> {
        await authUseCase.registerMember(account, password, nickname);
        await connectAndFetchProfile();
    }

    async function autoLogin(): Promise<void> {
        await authUseCase.autoLogin();
        await connectAndFetchProfile();
    }

    function logout(): void {
        logger.info('logout');
        socketStore.disconnect();
        userUseCase.clearProfile();
        authUseCase.logout();
    }

    return { loginMember, loginGuest, registerMember, autoLogin, logout };
}
