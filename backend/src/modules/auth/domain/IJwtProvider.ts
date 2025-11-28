// backend/src/modules/auth/domain/IJwtProvider.ts

import type { IAuthPayload } from "./IAuthPayload"

export interface IJwtProvider {
    sign(authPayload: IAuthPayload, expiresInDays: number): string

    verify(token: string): IAuthPayload
}