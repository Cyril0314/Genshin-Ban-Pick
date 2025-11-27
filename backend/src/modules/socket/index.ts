// backend/src/modules/socket/index.ts

import http from 'http';

import { Server } from 'socket.io';

import { createSocketAuth } from './infra/socketAuth';
import { setupSocketIO } from './socketController';
import IRoomStateManager from './domain/IRoomStateManager';
import AuthService from '../auth/application/auth.service';
import AuthValidator from './infra/AuthValidator';

export function createSocketApp(server: http.Server, roomStateManager: IRoomStateManager, authService: AuthService) {
    const io = new Server(server, {
        cors: {
            // origin: ["http://localhost:5173", "http://52.87.171.134"], // 允許的前端來源
            origin: ['http://localhost:5173', 'http://52.87.171.134:3000'], // 允許的前端來源
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    const authValidator = new AuthValidator(authService)
    const attachAuth = createSocketAuth(authValidator); // 建立 middleware
    attachAuth(io); // 連接 middleware 和 io
    setupSocketIO(io, roomStateManager); // 設定 io
    return io;
}
