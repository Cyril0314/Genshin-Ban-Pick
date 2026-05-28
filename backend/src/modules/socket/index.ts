import http from 'http';

import { Server } from 'socket.io';

import { createSocketAuth } from './infra/socketAuth';
import { setupSocketIO } from './socketController';

import type { IRoomStateManager } from '../room/domain/IRoomStateManager';
import type { IJwtProvider } from '../auth/domain/IJwtProvider';
import type UserService from '../user/application/user.service';

export function createSocketApp(
    server: http.Server,
    roomStateManager: IRoomStateManager,
    jwtProvider: IJwtProvider,
    userService: UserService,
) {
    const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

    const io = new Server(server, {
        cors: {
            origin: corsOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    createSocketAuth(jwtProvider)(io);
    setupSocketIO(io, roomStateManager, userService);
    return io;
}
