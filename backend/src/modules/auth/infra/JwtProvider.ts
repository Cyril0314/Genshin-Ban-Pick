// backend/src/modules/auth/infra/JwtProvider.ts

import jwt from 'jsonwebtoken';
import { IAuthPayload } from '../domain/IAuthPayload.ts';
import { IJwtProvider } from '../domain/IJwtProvider.ts';
import { ExpiredTokenError, InvalidTokenError } from '../../../errors/AppError.ts';

export default class JwtProvider implements IJwtProvider {
    sign(authPayload: IAuthPayload, expiresInDays: number) {
        return jwt.sign(authPayload, process.env.JWT_SECRET as string, {
            expiresIn: `${expiresInDays}d`,
        });
    }

    verify(token: string): IAuthPayload {
        try {
            return jwt.verify(token, process.env.JWT_SECRET as string) as IAuthPayload;
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                throw new ExpiredTokenError();
            }
            throw new InvalidTokenError();
        }
    }
}
