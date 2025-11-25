// backend/src/socket/socketController.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../utils/logger.ts';
import { IRoomStateManager } from './managers/IRoomStateManager.ts';
import { registerChatSocket } from './modules/chatSocket.ts';
import { registerBoardSocket } from './modules/boardSocket.ts';
import { registerRoomSocket, handleRoomUserLeave } from './modules/roomSocket.ts';
import { registerStepSocket } from './modules/stepSocket.ts';
import { registerTeamSocket } from './modules/teamSocket.ts';
import { registerTacticalSocket } from './modules/tacticalSocket.ts';
import { RoomStateRepository, RoomUserService } from '../room/index.ts';

const logger = createLogger('SOCKET CONTROLLER');

export function setupSocketIO(io: Server, roomStateManager: IRoomStateManager) {
    const roomStateRepository = new RoomStateRepository(roomStateManager);
    const roomUserService = new RoomUserService(roomStateRepository);

    io.on('connection', (socket: Socket) => {
        logger.info(`User connected socket.id: ${socket.id} identity:`, socket.data.identity);

        registerRoomSocket(io, socket, roomUserService, roomStateManager);
        registerBoardSocket(io, socket, roomStateManager);
        registerStepSocket(io, socket, roomStateManager);
        registerTeamSocket(io, socket, roomStateManager);
        registerChatSocket(io, socket, roomStateManager);
        registerTacticalSocket(io, socket, roomStateManager);

        // 監聽斷線事件
        socket.on('disconnect', (reason) => {
            const roomId = (socket as any).roomId;
            if (!roomId) return;
            logger.info(`Received disconnect ${socket.id} roomId: ${roomId}`, reason);
            handleRoomUserLeave(io, socket, roomId, roomUserService);
        });
    });
}
