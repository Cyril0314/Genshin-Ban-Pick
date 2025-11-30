// backend/src/modules/socket/socketController.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../utils/logger';
import { registerChatSocket } from './modules/chatSocket';
import { registerBoardSocket } from './modules/boardSocket';
import { registerRoomSocket } from './modules/roomSocket';
import { registerStepSocket } from './modules/stepSocket';
import { registerTeamSocket } from './modules/teamSocket';
import { registerTacticalSocket } from './modules/tacticalSocket';
import { RoomStateRepository, RoomUserService } from '../room/index';
import { BoardService, MatchStepService } from '../board';
import { ChatService } from '../chat';
import { TeamService } from '../team';
import { TacticalService } from '../tactical';

import type { IRoomStateManager } from './domain/IRoomStateManager';

const logger = createLogger('SOCKET CONTROLLER');

export function setupSocketIO(io: Server, roomStateManager: IRoomStateManager) {
    const roomStateRepository = new RoomStateRepository(roomStateManager);
    const roomUserService = new RoomUserService(roomStateRepository);
    const boardService = new BoardService(roomStateRepository);
    const matchStepService = new MatchStepService(roomStateRepository);
    const chatService = new ChatService(roomStateRepository);
    const teamService = new TeamService(roomStateRepository);
    const tacticalService = new TacticalService(roomStateRepository);

    io.on('connection', (socket: Socket) => {
        logger.info(`User connected socket.id: ${socket.id} identity:`, socket.data.identity);

        registerRoomSocket(io, socket, roomUserService);
        registerBoardSocket(io, socket, boardService);
        registerStepSocket(io, socket, matchStepService);
        registerTeamSocket(io, socket, teamService);
        registerChatSocket(io, socket, chatService);
        registerTacticalSocket(io, socket, tacticalService);
    });
}

// 調用	                        A 是否收到	B 是否收到	C 是否收到	備註
// socket.emit(...)	               ✅     	 ❌	       ❌	 僅自己收到
// socket.to(roomId).emit(...)	   ❌	     ✅	       ✅	 除自己外所有人
// io.to(roomId).emit(...)	       ✅	     ✅	       ✅	 全房間都收到