import { Server, Socket } from 'socket.io';

import { MissingFieldsError } from '../../../errors/AppError';

import type { IJwtProvider } from '../../auth/domain/IJwtProvider';

export function createSocketAuth(jwtProvider: IJwtProvider) {
    return function attachAuthMiddleware(io: Server) {
        io.use(async (socket: Socket, next) => {
            const { token } = socket.handshake.auth as { token: string };
            if (!token) return next(new MissingFieldsError());
            try {
                socket.data.identity = jwtProvider.verify(token);
                return next();
            } catch (err: any) {
                return next(err);
            }
        });
    };
}
