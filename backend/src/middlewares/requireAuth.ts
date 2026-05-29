import { InvalidTokenError } from '../errors/AppError';

import type { RequestHandler } from 'express';
import type { IJwtProvider } from '../modules/auth/domain/IJwtProvider';

export function createRequireAuth(jwtProvider: IJwtProvider): RequestHandler {
    return (req, _res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) throw new InvalidTokenError();
            req.user = jwtProvider.verify(authHeader.split(' ')[1]);
            next();
        } catch (err) {
            next(err);
        }
    };
}
