// src/modules/auth/infrastructure/AuthRepository.ts

import type AuthService from './AuthService';

import type { AuthUser } from '@shared/contracts/auth/AuthUser';

export default class AuthRepository {
    constructor(private authService: AuthService) {}

    async autoLogin(token: string): Promise<AuthUser> {
        const response = await this.authService.getSession();
        const { type, id, nickname } = response.data;
        const authUser: AuthUser =
            type === 'Member'
                ? { type, id, nickname, account: response.data.account, role: response.data.role }
                : { type: 'Guest', id, nickname };
        return authUser;
    }

    async loginGuest(payload: { nickname: string }): Promise<Extract<AuthUser, { type: 'Guest' }> & { token: string }> {
        const response = await this.authService.postLoginGuest(payload);
        const { id, nickname, token } = response.data;
        const authUser: AuthUser = { type: 'Guest', id, nickname };
        return { ...authUser, token };
    }

    async loginMember(payload: { account: string; password: string }): Promise<Extract<AuthUser, { type: 'Member' }> & { token: string }> {
        const response = await this.authService.postLoginMember(payload);
        const { id, nickname, account, role, token } = response.data;
        const authUser: AuthUser = { type: 'Member', id, nickname, account, role };
        return { ...authUser, token };
    }

    async registerMember(payload: { account: string; password: string; nickname: string }): Promise<Extract<AuthUser, { type: 'Member' }> & { token: string }> {
        const response = await this.authService.postRegisterMember(payload);
        const { id, nickname, account, role, token } = response.data;
        const authUser: AuthUser = { type: 'Member', id, nickname, account, role };
        return { ...authUser, token };
    }
}
