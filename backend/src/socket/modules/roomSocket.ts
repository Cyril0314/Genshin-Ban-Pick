// backend/src/socket/modules/roomSocket.ts

import { Server, Socket } from "socket.io";
import { syncImageState } from "./imageSocket.ts";
import { syncStepState } from "./stepSocket.ts";
import { syncTeamState } from "./teamSocket.ts";
import { syncChatState } from "./chatSocket.ts";

interface RoomUser {
  id: string;
  nickname: string;
  timestamp: number;
  team: "aether" | "lumine" | null;
}

const roomUsersState: Record<string, RoomUser[]> = {};

export function registerRoomSocket(io: Server, socket: Socket) {
  socket.on("room.user.join.request", (roomId: string) => {
    console.log(`[Server] ${socket.id} joined room: ${roomId}`);
    socket.join(roomId);
    (socket as any).roomId = roomId;

    const nickname = socket.data.nickname as string;
    const roomUser = { id: socket.id, nickname: nickname, timestamp: Date.now(), team: null };

    roomUsersState[roomId] ||= [];
    if (!roomUsersState[roomId].some(roomUser => roomUser.id === socket.id)) {
      roomUsersState[roomId].push(roomUser);
    }

    syncImageState(socket, roomId);
    syncStepState(socket, roomId);
    syncTeamState(socket, roomId);
    syncChatState(socket, roomId);

    socket.to(roomId).emit("room.user.join.broadcast", roomUser);

    io.to(roomId).emit("room.users.update.broadcast", roomUsersState[roomId]);
  });

  socket.on("room.user.leave.request", (roomId: string) => {
    socket.leave(roomId);
    console.log(`[Socket] ${socket.id} left ${roomId}`);

    const roomUsers = roomUsersState[roomId] || [];
    const leavingUser = roomUsers.find(roomUser => roomUser.id === socket.id);

    roomUsersState[roomId] = roomUsers.filter(roomUser => roomUser.id !== socket.id);

    delete (socket as any).roomId;

    if (leavingUser) {
      io.to(roomId).emit("room.user.leave.broadcast", leavingUser);
    }

    io.to(roomId).emit("room.users.update.broadcast", roomUsersState[roomId]);
  });
}
