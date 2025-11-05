// backend/src/socket/socketController.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../utils/logger.ts';
import { RoomStateManager } from './managers/RoomStateManager.ts';
import { registerChatSocket } from './modules/chatSocket.ts';
import { registerBoardSocket } from './modules/boardSocket.ts';
import { registerRoomSocket, handleRoomUserLeave } from './modules/roomSocket.ts';
import { registerStepSocket } from './modules/stepSocket.ts';
import { registerTeamSocket } from './modules/teamSocket.ts';
import { registerTaticalSocket } from './modules/taticalSocket.ts';

const logger = createLogger('SOCKET CONTROLLER');

export function setupSocketIO(io: Server) {
    io.on('connection', (socket: Socket) => {
        logger.info(`User connected socket.id: ${socket.id} identity:`, socket.data.identity);

        const roomStateManager = new RoomStateManager();

        registerRoomSocket(io, socket, roomStateManager);
        registerBoardSocket(io, socket, roomStateManager);
        registerStepSocket(io, socket, roomStateManager);
        registerTeamSocket(io, socket, roomStateManager);
        registerChatSocket(io, socket, roomStateManager);
        registerTaticalSocket(io, socket, roomStateManager);

        // 監聽斷線事件
        socket.on('disconnect', (reason) => {
            const roomId = (socket as any).roomId;
            if (!roomId) return;
            logger.info(`Received disconnect ${socket.id} roomId: ${roomId}`, reason);
            handleRoomUserLeave(io, socket, roomId, roomStateManager);
        });
    });
}
