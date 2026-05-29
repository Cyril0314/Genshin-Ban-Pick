// src/modules/auth/application/authUseCase.ts

import { createLogger } from '@/app/utils/logger';
import { useAuthStore } from '../store/authStore';

import type AuthRepository from '../infrastructure/AuthRepository';

const logger = createLogger('auth.application');

export default class AuthUseCase {
    constructor(private authStore: ReturnType<typeof useAuthStore>, private authRepository: AuthRepository) {}

    async registerMember(account: string, password: string, nickname: string): Promise<void> {
        const { token, ...principal } = await this.authRepository.registerMember({ account, password, nickname });
        this.authStore.setPrincipal(principal);
        this.authStore.setToken(token);
        logger.info('register member ok', account);
    }

    async loginMember(account: string, password: string): Promise<void> {
        const { token, ...principal } = await this.authRepository.loginMember({ account, password });
        this.authStore.setPrincipal(principal);
        this.authStore.setToken(token);
        logger.info('login member ok', account);
    }

    async loginGuest(): Promise<void> {
        const nickname = `guest_${Math.random().toString(36).slice(2, 8)}`;
        const { token, ...principal } = await this.authRepository.loginGuest({ nickname });
        this.authStore.setPrincipal(principal);
        this.authStore.setToken(token);
        logger.info('login guest ok');
    }

    async autoLogin(): Promise<void> {
        const token = this.authStore.getToken();
        if (!token) {
            logger.debug('no token, skip auto login');
            return;
        }

        try {
            const principal = await this.authRepository.autoLogin(token);
            this.authStore.setPrincipal(principal);
            logger.info('auto login ok');
        } catch (error) {
            logger.warn('auto login failed, token cleared', error);
            this.authStore.setToken(undefined);
            this.authStore.setPrincipal(undefined);
        }
    }

    logout() {
        logger.info('logout');
        this.authStore.setPrincipal(undefined);
        this.authStore.setToken(undefined);
    }
}
