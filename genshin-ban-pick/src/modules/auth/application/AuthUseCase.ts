// src/modules/auth/application/authUseCase.ts

import { useAuthStore } from '../store/authStore';

import type AuthRepository from '../infrastructure/AuthRepository';

export default class AuthUseCase {
    constructor(private authStore: ReturnType<typeof useAuthStore>, private authRepository: AuthRepository) {}

    async registerMember(account: string, password: string, nickname: string) {
        const { identity, token } = await this.authRepository.registerMember({ account, password, nickname });
        this.authStore.setIdentity(identity);
        this.authStore.setToken(token);
        return { identity, token };
    }

    async loginMember(account: string, password: string) {
        const { identity, token } = await this.authRepository.loginMember({ account, password });
        this.authStore.setIdentity(identity);
        this.authStore.setToken(token);
        return { identity, token };
    }

    async loginGuest() {
        const { identity, token } = await this.authRepository.loginGuest();
        this.authStore.setIdentity(identity);
        this.authStore.setToken(token);
        return { identity, token };
    }

    async autoLogin() {
        if (this.authStore.isInitialized) {
            const token = this.authStore.getToken();
            const identity = this.authStore.identity;
            return { identity, token };
        }

        const token = this.authStore.getToken();
        if (!token) {
            this.authStore.setInitialized(true);
            return { identity: undefined, token: undefined };
        }

        try {
            const identity = await this.authRepository.autoLogin(token);
            this.authStore.setIdentity(identity);
            return { identity, token };
        } catch (error) {
            this.authStore.setToken(undefined);
            this.authStore.setIdentity(undefined);
            return { identity: undefined, token: undefined };
        } finally {
            this.authStore.setInitialized(true);
        }
    }

    logout() {
        this.authStore.setIdentity(undefined);
        this.authStore.setToken(undefined);
    }
}
