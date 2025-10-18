// backend/src/socket/modules/stepSocket.ts

import { Server, Socket } from "socket.io";

import { logger } from '../../utils/logger.ts';
import { createRoomSetting } from "../../factories/roomSettingFactory.ts";
import { IBanPickStep } from '../../types/IBanPickStep.ts'

enum SocketEvent {
    STEP_ADVANCE_REQUEST = 'step.advance.request',
    STEP_ROLLBACK_REQUEST = 'step.rollback.request',
    STEP_RESET_REQUEST = 'step.reset.request',
    STEP_UPDATE_BROADCAST = 'step.update.broadcast',

    STEP_STATE_SYNC = 'step.state.sync',
}

type RoomId = string;
const stepState: Record<RoomId, number> = {};
const banPickSteps = createRoomSetting().banPickSteps;

export function registerStepSocket(io: Server, socket: Socket) {
  socket.on(`${SocketEvent.STEP_ADVANCE_REQUEST}`, ({ senderId }) => {
    logger.info(`Sent ${SocketEvent.STEP_ADVANCE_REQUEST} senderId: ${senderId}`);
    const roomId = (socket as any).roomId;
    if (!roomId) return;
    advanceStep(io, roomId);
  });

  socket.on(`${SocketEvent.STEP_ROLLBACK_REQUEST}`, ({ senderId }) => {
    logger.info(`Sent ${SocketEvent.STEP_ROLLBACK_REQUEST} senderId: ${senderId}`);
    const roomId = (socket as any).roomId;
    if (!roomId) return;
    rollbackStep(io, roomId);
  });

  socket.on(`${SocketEvent.STEP_RESET_REQUEST}`, ({ senderId }) => {
    logger.info(`Sent ${SocketEvent.STEP_RESET_REQUEST} senderId: ${senderId}`);
    const roomId = (socket as any).roomId;
    if (!roomId) return;
    resetStep(io, roomId);
  });
}

export function syncStepState(socket: Socket, roomId: RoomId) {
  const step = getCurrentStep(roomId);
  socket.emit(`${SocketEvent.STEP_STATE_SYNC}`, step);
  logger.info(`Sent ${SocketEvent.STEP_STATE_SYNC} step: ${step}`);
}

function getCurrentStep(roomId: RoomId): IBanPickStep | null {
  const index = stepState[roomId] || 0;
  return banPickSteps[index] || null;
}

function advanceStep(io: Server, roomId: RoomId): void {
  stepState[roomId] = (stepState[roomId] || 0) + 1;
  const step = getCurrentStep(roomId);
  io.to(roomId).emit(`${SocketEvent.STEP_UPDATE_BROADCAST}`, step);
  logger.info(`Sent ${SocketEvent.STEP_UPDATE_BROADCAST} step: ${step}`);
}

function rollbackStep(io: Server, roomId: RoomId): void {
  stepState[roomId] = (stepState[roomId] || 0) - 1;
  const step = getCurrentStep(roomId);
  io.to(roomId).emit(`${SocketEvent.STEP_UPDATE_BROADCAST}`, step);
  logger.info(`Sent ${SocketEvent.STEP_UPDATE_BROADCAST} step: ${step}`);
}

function resetStep(io: Server, roomId: RoomId): void {
  stepState[roomId] = 0;
  const step = getCurrentStep(roomId);
  io.to(roomId).emit(`${SocketEvent.STEP_UPDATE_BROADCAST}`, step);
  logger.info(`Sent ${SocketEvent.STEP_UPDATE_BROADCAST} step: ${step}`);
}
