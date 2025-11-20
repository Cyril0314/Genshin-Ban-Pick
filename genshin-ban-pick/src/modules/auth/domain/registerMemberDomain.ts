// src/modules/auth/domain/registerMemberDomain.ts

import { authService } from '../infrastructure/authService';
import type { Identity } from '../types/Identity';

export async function registerMemberDomain(payload: {
    account: string;
    password: string;
    nickname: string;
}) {
    const response = await authService.postRegisterMember(payload);
    const identity: Identity = { type: 'Member', user: { ...response.data } };
    const token = response.data.token;
    return { identity, token };
}
