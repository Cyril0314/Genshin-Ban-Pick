// backend/src/socket/modules/tacticalSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../utils/logger.ts';
import { RoomStateManager } from '../managers/RoomStateManager.ts';
import { IRoomStateManager } from '../managers/IRoomStateManager.ts';
import { IRoomUser } from '../../types/IRoomUser.ts';

const logger = createLogger('TATICAL SOCKET');

enum TacticalEvent {
    CellImagePlaceRequest = 'tactical.cell.image.place.request',
    CellImagePlaceBroadcast = 'tactical.cell.image.place.broadcast',

    CellImageRemoveRequest = 'tactical.cell.image.remove.request',
    CellImageRemoveBroadcast = 'tactical.cell.image.remove.broadcast',

    CellImageMapResetRequest = 'tactical.cell.image_map.reset.request',
    CellImageMapResetBroadcast = 'tactical.cell.image_map.reset.broadcast',

    CellImageMapStateRequest = 'tactical.cell.image_map.state.request',
    CellImageMapStateSyncSelf = 'tactical.cell.image_map.state.sync.self',
}

export function registerTacticalSocket(io: Server, socket: Socket, roomStateManager: IRoomStateManager) {
    socket.on(`${TacticalEvent.CellImagePlaceRequest}`, ({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) => {
        logger.info(`Received ${TacticalEvent.CellImagePlaceRequest}`, { teamSlot, cellId, imgId });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        roomState.teamTacticalBoardMap[teamSlot][cellId] = imgId;
        socket.to(roomId).emit(`${TacticalEvent.CellImagePlaceBroadcast}`, { teamSlot, cellId, imgId });
        logger.info(`Sent ${TacticalEvent.CellImagePlaceBroadcast}`, { teamSlot, cellId, imgId });
    });

    socket.on(`${TacticalEvent.CellImageRemoveRequest}`, ({ teamSlot, cellId }: { teamSlot: number; cellId: number }) => {
        logger.info(`Received ${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        delete roomState.teamTacticalBoardMap[teamSlot][cellId];
        socket.to(roomId).emit(`${TacticalEvent.CellImageRemoveBroadcast}`, { teamSlot, cellId });
        logger.info(`Sent ${TacticalEvent.CellImageRemoveBroadcast}`, { teamSlot, cellId });
    });

    socket.on(`${TacticalEvent.CellImageMapResetRequest}`, ({ teamSlot }: { teamSlot: number }) => {
        logger.info(`Received ${TacticalEvent.CellImageMapResetRequest}`, { teamSlot });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        roomState.teamTacticalBoardMap[teamSlot] = {};
        socket.to(roomId).emit(`${TacticalEvent.CellImageMapResetBroadcast}`, { teamSlot });
        logger.info(`Sent ${TacticalEvent.CellImageMapResetBroadcast}`, { teamSlot });
    });

    socket.on(`${TacticalEvent.CellImageMapStateRequest}`, ({ teamSlot }: { teamSlot: number }) => {
        logger.info(`Received ${TacticalEvent.CellImageMapStateRequest}`, { teamSlot });
        const roomId = (socket as any).roomId;
        syncTacticalCellImageMapStateSelf(socket, roomId, roomStateManager, teamSlot);
    });
}

export function syncTacticalCellImageMapStateSelf(socket: Socket, roomId: string, roomStateManager: IRoomStateManager, teamSlot: number) {
    const tacticalCellImageMap = roomStateManager.getTeamTacticalBoardMap(roomId)[teamSlot];
    socket.emit(`${TacticalEvent.CellImageMapStateSyncSelf}`, { teamSlot, tacticalCellImageMap });
    logger.info(`Sent ${TacticalEvent.CellImageMapStateSyncSelf}`, { teamSlot, tacticalCellImageMap });
}

export function syncTacticalCellImageMapStateOther(
    roomUser: IRoomUser,
    io: Server,
    roomId: string,
    roomStateManager: IRoomStateManager,
    teamSlot: number,
) {
    const tacticalCellImageMap = roomStateManager.getTeamTacticalBoardMap(roomId)[teamSlot];
    io.to(roomUser.id).emit(`${TacticalEvent.CellImageMapStateSyncSelf}`, { teamSlot, tacticalCellImageMap });
    logger.info(`Sent ${TacticalEvent.CellImageMapStateSyncSelf}`, { teamSlot, tacticalCellImageMap });
}
