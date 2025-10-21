// backend/src/socket/modules/stepSocket.ts

import { Server, Socket } from "socket.io";

import { createLogger } from '../../utils/logger.ts';
import { RoomStateManager } from "../managers/RoomStateManager.ts";

const logger = createLogger('STEP Socket')

enum SocketEvent {
  STEP_ADVANCE_REQUEST = 'step.advance.request',
  STEP_ROLLBACK_REQUEST = 'step.rollback.request',
  STEP_RESET_REQUEST = 'step.reset.request',

  STEP_STATE_SYNC_SELF = 'step.state.sync.self',
  STEP_STATE_SYNC_ALL = 'step.state.sync.all',
}

type RoomId = string;

export function registerStepSocket(io: Server, socket: Socket, roomStateManager: RoomStateManager) {
  socket.on(`${SocketEvent.STEP_ADVANCE_REQUEST}`, () => {
    logger.info(`Sent ${SocketEvent.STEP_ADVANCE_REQUEST}`);
    const roomId = (socket as any).roomId;
    if (!roomId) return;

    const roomState = roomStateManager.ensure(roomId);
    roomState.stepIndex = roomState.stepIndex + 1;
    io.to(roomId).emit(`${SocketEvent.STEP_STATE_SYNC_ALL}`, roomState.stepIndex);
    logger.info(`Sent ${SocketEvent.STEP_STATE_SYNC_ALL} stepIndex: ${roomState.stepIndex}`);
  });

  socket.on(`${SocketEvent.STEP_ROLLBACK_REQUEST}`, () => {
    logger.info(`Sent ${SocketEvent.STEP_ROLLBACK_REQUEST}`);
    const roomId = (socket as any).roomId;
    if (!roomId) return;

    const roomState = roomStateManager.ensure(roomId);
    roomState.stepIndex = roomState.stepIndex - 1;
    io.to(roomId).emit(`${SocketEvent.STEP_STATE_SYNC_ALL}`, roomState.stepIndex);
    logger.info(`Sent ${SocketEvent.STEP_STATE_SYNC_ALL} stepIndex: ${roomState.stepIndex}`);
  });

  socket.on(`${SocketEvent.STEP_RESET_REQUEST}`, () => {
    logger.info(`Sent ${SocketEvent.STEP_RESET_REQUEST}`);
    const roomId = (socket as any).roomId;
    if (!roomId) return;

    const roomState = roomStateManager.ensure(roomId);
    roomState.stepIndex = 0;
    io.to(roomId).emit(`${SocketEvent.STEP_STATE_SYNC_ALL}`, roomState.stepIndex);
    logger.info(`Sent ${SocketEvent.STEP_STATE_SYNC_ALL} stepIndex: ${roomState.stepIndex}`);
  });
}

export function syncStepState(socket: Socket, roomId: RoomId, roomStateManager: RoomStateManager) {
  const stepIndex = roomStateManager.getStepIndex(roomId)
  socket.emit(`${SocketEvent.STEP_STATE_SYNC_SELF}`, stepIndex);
  logger.info(`Sent ${SocketEvent.STEP_STATE_SYNC_SELF} stepIndex: ${stepIndex}`);
}