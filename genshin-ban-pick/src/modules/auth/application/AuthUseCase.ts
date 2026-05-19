// src/modules/auth/application/authUseCase.ts

import { createLogger } from '@/app/utils/logger';
import { useAuthStore } from '../store/authStore';

import type AuthRepository from '../infrastructure/AuthRepository';

const logger = createLogger('auth.application');

export default class AuthUseCase {
    constructor(private authStore: ReturnType<typeof useAuthStore>, private authRepository: AuthRepository) {}

    async registerMember(account: string, password: string, nickname: string) {
        const { authUser, token } = await this.authRepository.registerMember({ account, password, nickname });
        this.authStore.setAuthUser(authUser);
        this.authStore.setToken(token);
        logger.info('register member ok', account);
        return { authUser, token };
    }

    async loginMember(account: string, password: string) {
        const { authUser, token } = await this.authRepository.loginMember({ account, password });
        this.authStore.setAuthUser(authUser);
        this.authStore.setToken(token);
        logger.info('login member ok', account);
        return { authUser, token };
    }

    async loginGuest() {
        const { authUser, token } = await this.authRepository.loginGuest();
        this.authStore.setAuthUser(authUser);
        this.authStore.setToken(token);
        logger.info('login guest ok');
        return { authUser, token };
    }

    async autoLogin() {
        if (this.authStore.isInitialized) {
            logger.debug('already initialized, skip');
            const token = this.authStore.getToken();
            const authUser = this.authStore.authUser;
            return { authUser, token };
        }

        const token = this.authStore.getToken();
        if (!token) {
            logger.debug('no token, skip auto login');
            this.authStore.setInitialized(true);
            return { authUser: undefined, token: undefined };
        }

        try {
            const authUser = await this.authRepository.autoLogin(token);
            this.authStore.setAuthUser(authUser);
            logger.info('auto login ok');
            return { authUser, token };
        } catch (error) {
            logger.warn('auto login failed, token cleared', error);
            this.authStore.setToken(undefined);
            this.authStore.setAuthUser(undefined);
            return { authUser: undefined, token: undefined };
        } finally {
            this.authStore.setInitialized(true);
        }
    }

    logout() {
        logger.info('logout');
        this.authStore.setAuthUser(undefined);
        this.authStore.setToken(undefined);
    }
}
