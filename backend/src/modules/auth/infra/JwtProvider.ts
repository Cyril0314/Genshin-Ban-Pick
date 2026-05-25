// backend/src/modules/auth/infra/JwtProvider.ts

import jwt from 'jsonwebtoken';

import { ExpiredTokenError, InvalidTokenError } from '../../../errors/AppError';

import type { Principal } from '@shared/contracts/auth/Principal';
import type { IJwtProvider } from '../domain/IJwtProvider';

export default class JwtProvider implements IJwtProvider {
    sign(user: Principal, expiresInDays: number) {
        return jwt.sign(user, process.env.JWT_SECRET as string, {
            expiresIn: `${expiresInDays}d`,
        });
    }

    verify(token: string): Principal {
        try {
            return jwt.verify(token, process.env.JWT_SECRET as string) as Principal;
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new ExpiredTokenError();
            }
            throw new InvalidTokenError();
        }
    }
}
