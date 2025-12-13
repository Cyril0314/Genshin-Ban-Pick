// src/modules/auth/infrastructure/AuthService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';

export default class AuthService {
    constructor(private client: HttpClient) {}

    async postRegisterMember(payload: { account: string; password: string; nickname: string }) {
        return this.client.post('/auth/register/member', payload, { withToken: false });
    }

    async postLoginMember(payload: { account: string; password: string }) {
        return this.client.post('/auth/login/member', payload, { withToken: false });
    }

    async postLoginGuest(payload: { nickname: string }) {
        return this.client.post('/auth/login/guest', payload, { withToken: false });
    }

    async getSession() {
        return this.client.get('/auth/session');
    }
}