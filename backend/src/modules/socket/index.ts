// backend/src/modules/socket/index.ts

import http from 'http';

import { Server } from 'socket.io';

import { createSocketAuth } from './infra/socketAuth';
import { setupSocketIO } from './socketController';
import AuthValidator from './infra/AuthValidator';

import type { IRoomStateManager } from './domain/IRoomStateManager';

export function createSocketApp(server: http.Server, roomStateManager: IRoomStateManager, authValidator: AuthValidator) {
    const io = new Server(server, {
        cors: {
            // origin: ["http://localhost:5173", "http://54.224.88.154"], // 允許的前端來源
            origin: ['http://localhost:5173', 'http://54.224.88.154:3000'], // 允許的前端來源
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    const attachAuth = createSocketAuth(authValidator); // 建立 middleware
    attachAuth(io); // 連接 middleware 和 io
    setupSocketIO(io, roomStateManager); // 設定 io
    return io;
}
