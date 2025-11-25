// backend/src/modules/socket/socketAuth.ts

import { Server, Socket } from 'socket.io';
import GuestService from '../auth/application/guest.service.ts';
import MemberService from '../auth/application/member.service.ts';
import { MissingFieldsError, UserNotFoundError } from '../../errors/AppError.ts';
import { IJwtProvider } from '../auth/domain/IJwtProvider.ts';

export function createSocketAuth(memberService: MemberService, guestService: GuestService, jwtProvider: IJwtProvider) {
    return function attachAuthMiddleware(io: Server) {
        io.use(async (socket: Socket, next) => {
            const { token } = socket.handshake.auth as { token: string };
            if (token === null) {
                return next(new MissingFieldsError());
            }
            try {
                const payload = jwtProvider.verify(token);

                let result;
                switch (payload.type) {
                    case 'Guest':
                        result = await guestService.getById(payload.id);
                        break;
                    case 'Member':
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
