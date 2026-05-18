// src/modules/auth/application/authUseCase.ts

import { createLogger } from '@/app/utils/logger';
import { useAuthStore } from '../store/authStore';

import type AuthRepository from '../infrastructure/AuthRepository';

const logger = createLogger('auth.application');

export default class AuthUseCase {
    constructor(private authStore: ReturnType<typeof useAuthStore>, private authRepository: AuthRepository) {}

    async registerMember(account: string, password: string, nickname: string) {
        const { identity, token } = await this.authRepository.registerMember({ account, password, nickname });
        this.authStore.setIdentity(identity);
        this.authStore.setToken(token);
        logger.info('register member ok', account);
        return { identity, token };
    }

    async loginMember(account: string, password: string) {
        const { identity, token } = await this.authRepository.loginMember({ account, password });
        this.authStore.setIdentity(identity);
        this.authStore.setToken(token);
        logger.info('login member ok', account);
        return { identity, token };
    }

    async loginGuest() {
        const { identity, token } = await this.authRepository.loginGuest();
        this.authStore.setIdentity(identity);
        this.authStore.setToken(token);
        logger.info('login guest ok');
        return { identity, token };
    }

    async autoLogin() {
        if (this.authStore.isInitialized) {
            logger.debug('already initialized, skip');
            const token = this.authStore.getToken();
            const identity = this.authStore.identity;
            return { identity, token };
        }

        const token = this.authStore.getToken();
        if (!token) {
            logger.debug('no token, skip auto login');
            this.authStore.setInitialized(true);
            return { identity: undefined, token: undefined };
        }

        try {
            const identity = await this.authRepository.autoLogin(token);
            this.authStore.setIdentity(identity);
            logger.info('auto login ok');
            return { identity, token };
        } catch (error) {
            logger.warn('auto login failed, token cleared', error);
            this.authStore.setToken(undefined);
            this.authStore.setIdentity(undefined);
            return { identity: undefined, token: undefined };
        } finally {
            this.authStore.setInitialized(true);
        }
    }

    logout() {
        logger.info('logout');
        this.authStore.setIdentity(undefined);
        this.authStore.setToken(undefined);
    }
}
