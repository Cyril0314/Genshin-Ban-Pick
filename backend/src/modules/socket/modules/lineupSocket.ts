// backend/src/modules/socket/modules/lineupSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger';
import { LineupEvent } from '@shared/contracts/lineup/value-types';
import { LineupService } from '../../lineup';

const logger = createLogger('socket.lineup');

export function registerLineupSocket(io: Server, socket: Socket, lineupService: LineupService) {
    socket.on(`${LineupEvent.ImagePlaceRequest}`, ({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) => {
        logger.debug(`Received ${LineupEvent.ImagePlaceRequest}`, { teamSlot, cellId, imgId });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        lineupService.place(roomId, { teamSlot, cellId, imgId });
        socket.to(roomId).emit(`${LineupEvent.ImagePlaceBroadcast}`, { teamSlot, cellId, imgId });
        logger.debug(`Sent ${LineupEvent.ImagePlaceBroadcast}`, { teamSlot, cellId, imgId });
    });

    socket.on(`${LineupEvent.ImageRemoveRequest}`, ({ teamSlot, cellId }: { teamSlot: number; cellId: number }) => {
        logger.debug(`Received ${LineupEvent.ImageRemoveRequest}`, { teamSlot, cellId });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        lineupService.remove(roomId, { teamSlot, cellId });
        socket.to(roomId).emit(`${LineupEvent.ImageRemoveBroadcast}`, { teamSlot, cellId });
        logger.debug(`Sent ${LineupEvent.ImageRemoveBroadcast}`, { teamSlot, cellId });
    });

    socket.on(`${LineupEvent.ImageMapResetRequest}`, ({ teamSlot }: { teamSlot: number }) => {
        logger.debug(`Received ${LineupEvent.ImageMapResetRequest}`, { teamSlot });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        lineupService.reset(roomId, { teamSlot });
        socket.to(roomId).emit(`${LineupEvent.ImageMapResetBroadcast}`, { teamSlot });
        logger.debug(`Sent ${LineupEvent.ImageMapResetBroadcast}`, { teamSlot });
    });

    socket.on(`${LineupEvent.AllTeamImageMapResetRequest}`, () => {
        logger.debug(`Received ${LineupEvent.AllTeamImageMapResetRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        lineupService.resetAll(roomId);
        socket.to(roomId).emit(`${LineupEvent.AllTeamImageMapResetBroadcast}`);
        logger.debug(`Sent ${LineupEvent.AllTeamImageMapResetBroadcast}`);
    });

    socket.on(`${LineupEvent.ImageMapStateRequest}`, ({ teamSlot }: { teamSlot: number }) => {
        logger.debug(`Received ${LineupEvent.ImageMapStateRequest}`, { teamSlot });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const lineupImageMap = lineupService.getTeamLineupImageMap(roomId)[teamSlot];
        socket.emit(`${LineupEvent.ImageMapStateSyncSelf}`, { teamSlot, lineupImageMap });
        logger.debug(`Sent ${LineupEvent.ImageMapStateSyncSelf}`, { teamSlot, lineupImageMap });
    });
}
