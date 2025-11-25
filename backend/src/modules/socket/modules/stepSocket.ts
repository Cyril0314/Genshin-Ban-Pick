// backend/src/modules/socket/modules/stepSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger.ts';
import { IRoomStateManager } from '../managers/IRoomStateManager.ts';

const logger = createLogger('STEP Socket');

enum StepEvent {
    AdvanceRequest = 'step.advance.request',
    RollbackRequest = 'step.rollback.request',
    ResetRequest = 'step.reset.request',

    StateSyncSelf = 'step.state.sync.self',
    StateSyncAll = 'step.state.sync.all',
}

type RoomId = string;

export function registerStepSocket(io: Server, socket: Socket, roomStateManager: IRoomStateManager) {
    socket.on(`${StepEvent.AdvanceRequest}`, () => {
        logger.info(`Sent ${StepEvent.AdvanceRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.get(roomId);
        if (!roomState) return;

        roomState.stepIndex = roomState.stepIndex + 1;
        syncStepStateAll(io, roomId, roomStateManager);
    });

    socket.on(`${StepEvent.RollbackRequest}`, () => {
        logger.info(`Sent ${StepEvent.RollbackRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.get(roomId);
        if (!roomState) return;

        roomState.stepIndex = roomState.stepIndex - 1;
        syncStepStateAll(io, roomId, roomStateManager);
    });

    socket.on(`${StepEvent.ResetRequest}`, () => {
        logger.info(`Sent ${StepEvent.ResetRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.get(roomId);
        if (!roomState) return;

        roomState.stepIndex = 0;
        syncStepStateAll(io, roomId, roomStateManager);
    });
}

export function syncStepStateSelf(socket: Socket, roomId: RoomId, roomStateManager: IRoomStateManager) {
    const stepIndex = roomStateManager.getStepIndex(roomId);
    socket.emit(`${StepEvent.StateSyncSelf}`, stepIndex);
    logger.info(`Sent ${StepEvent.StateSyncSelf} stepIndex: ${stepIndex}`);
}

export function syncStepStateAll(io: Server, roomId: RoomId, roomStateManager: IRoomStateManager) {
    const stepIndex = roomStateManager.getStepIndex(roomId);
    io.to(roomId).emit(`${StepEvent.StateSyncAll}`, stepIndex);
    logger.info(`Sent ${StepEvent.StateSyncAll} stepIndex: ${stepIndex}`);
}
