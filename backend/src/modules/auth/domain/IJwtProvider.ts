// backend/src/modules/auth/domain/IJwtProvider.ts

import { IAuthPayload } from "./IAuthPayload.ts"

export interface IJwtProvider {
    sign(authPayload: IAuthPayload, expiresInDays: number): string

    verify(token: string): IAuthPayload
}