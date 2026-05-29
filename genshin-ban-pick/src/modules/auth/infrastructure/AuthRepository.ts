// src/modules/auth/infrastructure/AuthRepository.ts

import type AuthService from './AuthService';

import type { Principal } from '@shared/contracts/auth/Principal';

export default class AuthRepository {
    constructor(private authService: AuthService) {}

    async autoLogin(token: string): Promise<Principal> {
        const response = await this.authService.getSession();
        const { type, id } = response.data;
        const principal: Principal =
            type === 'Member'
                ? { type, id, role: response.data.role }
                : { type: 'Guest', id };
        return principal;
    }

    async loginGuest(payload: { nickname: string }): Promise<Extract<Principal, { type: 'Guest' }> & { token: string }> {
        const response = await this.authService.postLoginGuest(payload);
        const { id, token } = response.data;
        return { type: 'Guest', id, token };
    }

    async loginMember(payload: { account: string; password: string }): Promise<Extract<Principal, { type: 'Member' }> & { token: string }> {
        const response = await this.authService.postLoginMember(payload);
        const { id, role, token } = response.data;
        return { type: 'Member', id, role, token };
    }

    async registerMember(payload: { account: string; password: string; nickname: string }): Promise<Extract<Principal, { type: 'Member' }> & { token: string }> {
        const response = await this.authService.postRegisterMember(payload);
        const { id, role, token } = response.data;
        return { type: 'Member', id, role, token };
    }
}
