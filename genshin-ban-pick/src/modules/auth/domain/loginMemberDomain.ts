// src/modules/auth/domain/loginMemberDomain.ts

import { authService } from '../infrastructure/authService';
import type { Identity } from '../types/Identity';

export async function loginMemberDomain(payload: { account: string; password: string }) {
    const response = await authService.postLoginMember(payload);
    const identity: Identity = { type: 'Member', user: { ...response.data } };
    const token = response.data.token;
    return { identity, token };
}
