// backend/src/socket/modules/stepSocket.ts

import { Server, Socket } from "socket.io";

import { createRoomSetting } from "../../factories/roomSettingFactory.ts";
import { IBanPickStep } from '../../types/IBanPickStep.ts'

type RoomId = string;
const stepMap: Record<RoomId, number> = {};
const banPickSteps = createRoomSetting().banPickSteps;

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

function getCurrentStep(roomId: RoomId): IBanPickStep | null {
  const index = stepMap[roomId] || 0;
  return banPickSteps[index] || null;
}

function advanceStep(io: Server, roomId: RoomId): void {
  stepMap[roomId] = (stepMap[roomId] || 0) + 1;
  const step = getCurrentStep(roomId);
  io.to(roomId).emit('step.state.broadcast', step);
  console.log(`[Server] emit step.state.broadcast to roomId: ${roomId} step: ${JSON.stringify(step, null, 2)}`);
}

function rollbackStep(io: Server, roomId: RoomId): void {
  stepMap[roomId] = (stepMap[roomId] || 0) - 1;
  const step = getCurrentStep(roomId);
  io.to(roomId).emit('step.state.broadcast', step);
  console.log(`[Server] emit step.state.broadcast to roomId: ${roomId} step: ${JSON.stringify(step, null, 2)}`);
}

function resetStep(io: Server, roomId: RoomId): void {
  stepMap[roomId] = 0;
  const step = getCurrentStep(roomId);
  io.to(roomId).emit('step.state.broadcast', step);
  console.log(`[Server] emit step.state.broadcast to roomId: ${roomId} step: ${JSON.stringify(step, null, 2)}`);
}
