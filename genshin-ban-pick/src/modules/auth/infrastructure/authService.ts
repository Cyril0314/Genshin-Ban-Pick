// src/modules/auth/infrastructure/authService.ts

import api from '@/infrastructure/http/httpClient';
import type { HttpClient } from '@/infrastructure/http/httpClient';

export function createAuthService(client: HttpClient = api) {
    async function postRegisterMember(payload: { account: string; password: string; nickname: string }) {
        return client.post('/auth/register/member', payload, { withToken: false });
    }

    async function postLoginMember(payload: { account: string; password: string }) {
        return client.post('/auth/login/member', payload, { withToken: false });
    }

    async function postLoginGuest(payload: { nickname: string }) {
        return client.post('/auth/login/guest', payload, { withToken: false });
    }

    async function getSession() {
        return client.get('/auth/session');
    }

    return {
        postRegisterMember,
        postLoginMember,
        postLoginGuest,
        getSession,
    };
}

export const authService = createAuthService();
