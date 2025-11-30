// backend/src/modules/socket/modules/tacticalSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger';
import { TacticalEvent } from '@shared/contracts/tactical/value-types';
import { TacticalService } from '../../tactical';

const logger = createLogger('TATICAL SOCKET');

export function registerTacticalSocket(io: Server, socket: Socket, tacticalService: TacticalService) {
    socket.on(`${TacticalEvent.CellImagePlaceRequest}`, ({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) => {
        logger.info(`Received ${TacticalEvent.CellImagePlaceRequest}`, { teamSlot, cellId, imgId });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        tacticalService.place(roomId, { teamSlot, cellId, imgId });
        socket.to(roomId).emit(`${TacticalEvent.CellImagePlaceBroadcast}`, { teamSlot, cellId, imgId });
        logger.info(`Sent ${TacticalEvent.CellImagePlaceBroadcast}`, { teamSlot, cellId, imgId });
    });

    socket.on(`${TacticalEvent.CellImageRemoveRequest}`, ({ teamSlot, cellId }: { teamSlot: number; cellId: number }) => {
        logger.info(`Received ${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        tacticalService.remove(roomId, { teamSlot, cellId });
        socket.to(roomId).emit(`${TacticalEvent.CellImageRemoveBroadcast}`, { teamSlot, cellId });
        logger.info(`Sent ${TacticalEvent.CellImageRemoveBroadcast}`, { teamSlot, cellId });
    });

    socket.on(`${TacticalEvent.CellImageMapResetRequest}`, ({ teamSlot }: { teamSlot: number }) => {
        logger.info(`Received ${TacticalEvent.CellImageMapResetRequest}`, { teamSlot });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        tacticalService.reset(roomId, { teamSlot });
        socket.to(roomId).emit(`${TacticalEvent.CellImageMapResetBroadcast}`, { teamSlot });
        logger.info(`Sent ${TacticalEvent.CellImageMapResetBroadcast}`, { teamSlot });
    });

    socket.on(`${TacticalEvent.CellImageMapStateRequest}`, ({ teamSlot }: { teamSlot: number }) => {
        logger.info(`Received ${TacticalEvent.CellImageMapStateRequest}`, { teamSlot });
        const roomId = (socket as any).roomId;

        const tacticalCellImageMap = tacticalService.getTeamTacticalCellImageMap(roomId)[teamSlot];
        socket.emit(`${TacticalEvent.CellImageMapStateSyncSelf}`, { teamSlot, tacticalCellImageMap });
        logger.info(`Sent ${TacticalEvent.CellImageMapStateSyncSelf}`, { teamSlot, tacticalCellImageMap });
    });
}
