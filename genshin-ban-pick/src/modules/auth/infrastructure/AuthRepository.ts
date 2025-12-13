// src/modules/auth/infrastructure/AuthRepository.ts

import type AuthService from './AuthService';

import type { Identity } from '../types/Identity';

export default class AuthRepository {
    constructor(private authService: AuthService) {}

    async autoLogin(token: string) {
        const response = await this.authService.getSession();
        const identity: Identity = {
            type: response.data.type,
            user: { ...response.data },
        };
        return identity;
    }

    async loginGuest() {
        const nickname = `guest_${Math.random().toString(36).slice(2, 8)}`;
        const response = await this.authService.postLoginGuest({ nickname });
        const identity: Identity = { type: 'Guest', user: { ...response.data } };
        const token = response.data.token;
        return { identity, token };
    }

    async loginMember(payload: { account: string; password: string }) {
        const response = await this.authService.postLoginMember(payload);
        const identity: Identity = { type: 'Member', user: { ...response.data } };
        const token = response.data.token;
        return { identity, token };
    }
    
    async registerMember(payload: { account: string; password: string; nickname: string }) {
        const response = await this.authService.postRegisterMember(payload);
        const identity: Identity = { type: 'Member', user: { ...response.data } };
        const token = response.data.token;
        return { identity, token };
    }
}
