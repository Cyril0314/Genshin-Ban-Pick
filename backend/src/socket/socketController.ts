// backend/src/socket/socketController.ts

import { Server, Socket } from "socket.io";


import { logger } from '../utils/logger.ts';
import { registerChatSocket } from "./modules/chatSocket.ts";
import { registerBoardSocket } from "./modules/boardSocket.ts";
import { registerRoomSocket } from "./modules/roomSocket.ts";
import { registerStepSocket } from "./modules/stepSocket.ts";
import { registerTeamSocket } from "./modules/teamSocket.ts";

export function setupSocketIO(io: Server) {
  io.on("connection", (socket: Socket) => {
    logger.info(`User connected socket.id: ${socket.id}`, {
      userId: socket.data.userId ?? null,
      guestId: socket.data.guestId ?? null,
    });

    registerRoomSocket(io, socket);
    registerBoardSocket(io, socket);
    registerStepSocket(io, socket);
    registerTeamSocket(io, socket);
    registerChatSocket(io, socket);
  })
}
