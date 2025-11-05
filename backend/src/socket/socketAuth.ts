// backend/src/socket/socketAuth.ts

import { Server, Socket } from 'socket.io';
import { useJwt } from '../services/auth/jwt.ts';
import GuestService from '../services/auth/GuestService.ts';
import MemberService from '../services/auth/MemberService.ts';
import { MissingFieldsError, UserNotFoundError } from '../errors/AppError.ts';

export function createSocketAuth(guestService: GuestService, memberService: MemberService) {
    let jwt = useJwt();

    return function attachAuthMiddleware(io: Server) {
        io.use(async (socket: Socket, next) => {
            const { token } = socket.handshake.auth as { token: string };
            if (token === null) {
                return next(new MissingFieldsError());
            }
            try {
                const payload = jwt.verify(token);

                let result;
                switch (payload.type) {
                    case 'GUEST':
                        result = await guestService.getById(payload.id);
                        break;
                    case 'MEMBER':
                        result = await memberService.getById(payload.id);
                        break;
                    default:
                        return next(new UserNotFoundError());
                }
                if (!result) {
                    return next(new UserNotFoundError());
                }
                socket.data.identity = {
                    type: payload.type,
                    id: payload.id,
                    nickname: result.nickname,
                    identityKey: `${payload.type}:${payload.id}`,
                };

                return next();
            } catch (err: any) {
                return next(err);
            }
        });
    };
}
