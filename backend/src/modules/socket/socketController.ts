// backend/src/modules/socket/socketController.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../utils/logger';
import { registerChatSocket } from './modules/chatSocket';
import { registerBoardSocket } from './modules/boardSocket';
import { registerRoomSocket } from './modules/roomSocket';
import { registerTeamSocket } from './modules/teamSocket';
import { registerLineupSocket } from './modules/lineupSocket';
import { RoomStateRepository, RoomUserService } from '../room/index';
import { BoardService } from '../board';
import { ChatService } from '../chat';
import { TeamService } from '../team';
import { LineupService } from '../lineup';

import type { IRoomStateManager } from '../room/domain/IRoomStateManager';
import type UserService from '../user/application/user.service';

const logger = createLogger('socket.controller');

export function setupSocketIO(io: Server, roomStateManager: IRoomStateManager, userService: UserService) {
    const roomStateRepository = new RoomStateRepository(roomStateManager);
    const roomUserService = new RoomUserService(roomStateRepository, userService);
    const boardService = new BoardService(roomStateRepository);
    const chatService = new ChatService(roomStateRepository);
    const teamService = new TeamService(roomStateRepository);
    const lineupService = new LineupService(roomStateRepository);

    io.on('connection', (socket: Socket) => {
        logger.info(`User connected socket.id: ${socket.id} identity:`, socket.data.identity);

        registerRoomSocket(io, socket, roomUserService);
        registerBoardSocket(io, socket, boardService);
        registerTeamSocket(io, socket, teamService);
        registerChatSocket(io, socket, chatService);
        registerLineupSocket(io, socket, lineupService);
    });
}

// 調用	                        A 是否收到	B 是否收到	C 是否收到	備註
// socket.emit(...)	               ✅     	 ❌	       ❌	 僅自己收到
// socket.to(roomId).emit(...)	   ❌	     ✅	       ✅	 除自己外所有人
// io.to(roomId).emit(...)	       ✅	     ✅	       ✅	 全房間都收到