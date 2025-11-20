// src/modules/auth/domain/autoLoginDomain.ts

import { authService } from '../infrastructure/authService';
import type { Identity } from '../types/Identity';

export async function autoLoginDomain(token: string) {
    const response = await authService.getSession();
    const identity: Identity = {
        type: response.data.type,
        user: { ...response.data },
    };
    return identity;
}
