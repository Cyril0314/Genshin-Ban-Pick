// backend/src/socket/modules/stepSocket.ts

import { Server, Socket } from "socket.io";
import {
  advanceStep,
  rollbackStep,
  resetStep,
  getCurrentStep,
} from "../../banPickFlow.ts";

type RoomId = string;

export function registerStepSocket(io: Server, socket: Socket) {
  socket.on("step.advance.request", ({ senderId }) => {
    const roomId = (socket as any).roomId;
    if (!roomId) return;
    advanceStep(io, roomId);
  });

  socket.on("step.rollback.request", ({ senderId }) => {
    const roomId = (socket as any).roomId;
    if (!roomId) return;
    rollbackStep(io, roomId);
  });

  socket.on("step.reset.request", ({ senderId }) => {
    const roomId = (socket as any).roomId;
    if (!roomId) return;
    resetStep(io, roomId);
  });
}

export function syncStepState(socket: Socket, roomId: RoomId) {
  console.log("syncStepState");
  socket.emit("step.state.sync", getCurrentStep(roomId));
}