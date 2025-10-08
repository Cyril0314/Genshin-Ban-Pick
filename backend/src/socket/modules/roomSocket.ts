// backend/src/socket/modules/roomSocket.ts

import { Server, Socket } from "socket.io";
import { syncImageState } from "./imageSocket.ts";
import { syncStepState } from "./stepSocket.ts";
import { syncTeamState } from "./teamSocket.ts";
import { syncChatState } from "./chatSocket.ts";

export function registerRoomSocket(io: Server, socket: Socket) {
  socket.on("room.join.request", (roomId: string) => {
    console.log(`[Server] ${socket.id} joined room: ${roomId}`);
    socket.join(roomId);
    (socket as any).roomId = roomId;

    syncImageState(socket, roomId);
    syncStepState(socket, roomId);
    syncTeamState(socket, roomId);
    syncChatState(socket, roomId);
  });

  socket.on("room.leave.request", (roomId: string) => {
    socket.leave(roomId);
    console.log(`[Socket] ${socket.id} left ${roomId}`);
    delete (socket as any).roomId;
  });
}
