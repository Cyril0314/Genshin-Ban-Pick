// backend/src/modules/socket/modules/stepSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger';
import { StepEvent } from '@shared/contracts/board/value-types';
import { MatchStepService } from '../../board';

const logger = createLogger('STEP Socket');

type RoomId = string;

export function registerStepSocket(io: Server, socket: Socket, matchStepService: MatchStepService) {
    socket.on(`${StepEvent.AdvanceRequest}`, () => {
        logger.info(`Sent ${StepEvent.AdvanceRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        matchStepService.advance(roomId);
        syncStepStateAll(roomId);
    });

    socket.on(`${StepEvent.RollbackRequest}`, () => {
        logger.info(`Sent ${StepEvent.RollbackRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        matchStepService.rollback(roomId);
        syncStepStateAll(roomId);
    });

    socket.on(`${StepEvent.ResetRequest}`, () => {
        logger.info(`Sent ${StepEvent.ResetRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        matchStepService.reset(roomId);
        syncStepStateAll(roomId);
    });

    socket.on(`${StepEvent.StateRequest}`, () => {
        logger.info(`Sent ${StepEvent.StateRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const stepIndex = matchStepService.getStepIndex(roomId);
        socket.emit(`${StepEvent.StateSyncSelf}`, stepIndex);
        logger.info(`Sent ${StepEvent.StateSyncSelf} stepIndex: ${stepIndex}`);
    });

    function syncStepStateAll(roomId: RoomId) {
        const stepIndex = matchStepService.getStepIndex(roomId);
        io.to(roomId).emit(`${StepEvent.StateSyncAll}`, stepIndex);
        logger.info(`Sent ${StepEvent.StateSyncAll} stepIndex: ${stepIndex}`);
    }
}
