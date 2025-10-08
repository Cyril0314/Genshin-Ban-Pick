// backend/src/socket/socketController.ts

import { Server, Socket } from "socket.io";
import { registerRoomSocket } from "./modules/roomSocket.ts";
import { registerImageSocket } from "./modules/imageSocket.ts";
import { registerStepSocket } from "./modules/stepSocket.ts";
import { registerTeamSocket } from "./modules/teamSocket.ts";
import { registerChatSocket } from "./modules/chatSocket.ts";

export function setupSocketIO(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    console.log(`[SocketIO] ${socket.id} authenticated as`, {
      userId: socket.data.userId ?? null,
      guestId: socket.data.guestId ?? null,
    });

    registerRoomSocket(io, socket);
    registerImageSocket(io, socket);
    registerStepSocket(io, socket);
    registerTeamSocket(io, socket);
    registerChatSocket(io, socket);
  })
}
