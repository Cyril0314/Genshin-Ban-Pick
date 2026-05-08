// backend/src/modules/socket/index.ts

import http from 'http';

import { Server } from 'socket.io';

import { createSocketAuth } from './infra/socketAuth';
import { setupSocketIO } from './socketController';
import AuthValidator from './infra/AuthValidator';

import type { IRoomStateManager } from './domain/IRoomStateManager';

export function createSocketApp(server: http.Server, roomStateManager: IRoomStateManager, authValidator: AuthValidator) {
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
    const attachAuth = createSocketAuth(authValidator); // 建立 middleware
    attachAuth(io); // 連接 middleware 和 io
    setupSocketIO(io, roomStateManager); // 設定 io
    return io;
}
