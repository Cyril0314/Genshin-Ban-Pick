// backend/src/modules/socket/infra/socketAuth.ts

import { Server, Socket } from 'socket.io';
import { MissingFieldsError, UserNotFoundError } from '../../../errors/AppError';
import IAuthValidator from '../domain/IAuthValidator';

export function createSocketAuth(authValidator: IAuthValidator) {
    return function attachAuthMiddleware(io: Server) {
        io.use(async (socket: Socket, next) => {
            const { token } = socket.handshake.auth as { token: string };
            if (!token) {
                return next(new MissingFieldsError());
            }
            try {
                let result = await authValidator.verifySession(token)
                if (!result) {
                    return next(new UserNotFoundError());
                }
                socket.data.identity = {
                    type: result.type,
                    id: result.id,
                    nickname: result.nickname,
                    identityKey: `${result.type}:${result.id}`,
                };

                return next();
            } catch (err: any) {
                return next(err);
            }
        });
    };
}
