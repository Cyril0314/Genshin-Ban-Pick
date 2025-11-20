// src/modules/auth/domain/useAuthDomain.ts

import { authService } from '../infrastructure/authService';
import type { Identity } from '../types/Identity';

export async function registerMemberDomain(payload: {
    account: string;
    password: string;
    nickname: string;
}): Promise<{ identity: Identity; token: string }> {
    const response = await authService.postRegisterMember(payload);
    const identity: Identity = { type: 'Member', user: { ...response.data } };
    const token = response.data.token;
    return { identity, token };
}

export async function loginMemberDomain(payload: { account: string; password: string }): Promise<{ identity: Identity; token: string }> {
    const response = await authService.postLoginMember(payload);
    const identity: Identity = { type: 'Member', user: { ...response.data } };
    const token = response.data.token;
    return { identity, token };
}

export async function loginGuestDomain(): Promise<{ identity: Identity; token: string }> {
    const nickname = `guest_${Math.random().toString(36).slice(2, 8)}`;
    const response = await authService.postLoginGuest({ nickname });
    const identity: Identity = { type: 'Guest', user: { ...response.data } };
    const token = response.data.token;
    return { identity, token };
}

export async function autoLoginDomain(token: string): Promise<Identity> {
    const response = await authService.getSession();
    const identity: Identity = {
        type: response.data.type,
        user: { ...response.data },
    };
    return identity;
}
