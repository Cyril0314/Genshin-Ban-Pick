// src/modules/auth/domain/loginGuestDomain.ts

import { authService } from '../infrastructure/authService';
import type { Identity } from '../types/Identity';

export async function loginGuestDomain() {
    const nickname = `guest_${Math.random().toString(36).slice(2, 8)}`;
    const response = await authService.postLoginGuest({ nickname });
    const identity: Identity = { type: 'Guest', user: { ...response.data } };
    const token = response.data.token;
    return { identity, token };
}
