// backend/src/modules/socket/socketController.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../utils/logger';
import { registerChatSocket } from './modules/chatSocket';
import { registerBoardSocket } from './modules/boardSocket';
import { registerRoomSocket, handleRoomUserLeave } from './modules/roomSocket';
import { registerStepSocket } from './modules/stepSocket';
import { registerTeamSocket } from './modules/teamSocket';
import { registerTacticalSocket } from './modules/tacticalSocket';
import { RoomStateRepository, RoomUserService } from '../room/index';

import type { IRoomStateManager } from './domain/IRoomStateManager';

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
