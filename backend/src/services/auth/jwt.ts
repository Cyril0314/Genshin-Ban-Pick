// backend/src/services/auth/jwt.ts
import jwt from 'jsonwebtoken';

import { InvalidTokenError, ExpiredTokenError } from '../../errors/AppError.ts';
import { AuthPayload } from './AuthPayload.ts';

export function useJwt() {
    function sign(authPayload: AuthPayload, expiresInDays: number) {
        return jwt.sign(authPayload, process.env.JWT_SECRET as string, {
            expiresIn: `${expiresInDays}d`,
        });
    }

    function verify(token: string): AuthPayload {
        try {
            return jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new ExpiredTokenError();
            }
            throw new InvalidTokenError();
        }
    }

    return {
        sign,
        verify
    }
}
