// backend/src/modules/socket/index.ts

import http from 'http';

import { Server } from 'socket.io';

import { createSocketAuth } from './socketAuth.ts';
import { setupSocketIO } from './socketController.ts';
import GuestService from '../auth/application/guest.service.ts';
import MemberService from '../auth/application/member.service.ts';
import { IRoomStateManager } from './managers/IRoomStateManager.ts';
import { IJwtProvider } from '../auth/domain/IJwtProvider.ts';

export function createSocketApp(server: http.Server, roomStateManager: IRoomStateManager, memberService: MemberService, guestService: GuestService, jwtProvider: IJwtProvider) {
    const io = new Server(server, {
        cors: {
            // origin: ["http://localhost:5173", "http://52.87.171.134"], // 允許的前端來源
            origin: ['http://localhost:5173', 'http://52.87.171.134:3000'], // 允許的前端來源
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    const attachAuth = createSocketAuth(memberService, guestService, jwtProvider); // 建立 middleware
    attachAuth(io); // 連接 middleware 和 io
    setupSocketIO(io, roomStateManager); // 設定 io
    return io;
}
