// backend/src/modules/auth/domain/IJwtProvider.ts

import type { Principal } from '@shared/contracts/auth/Principal';

export interface IJwtProvider {
    sign(user: Principal, expiresInDays: number): string

    verify(token: string): Principal
}
