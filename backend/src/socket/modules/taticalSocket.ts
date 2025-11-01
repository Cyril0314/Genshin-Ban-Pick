// backend/src/socket/modules/taticalSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../utils/logger.ts';
import { RoomStateManager } from '../managers/RoomStateManager.ts';
import { IRoomUser } from '../../types/IRoomUser.ts';

const logger = createLogger('TATICAL SOCKET');

enum SocketEvent {
    TATICAL_CELL_IMAGE_PLACE_REQUEST = 'tatical.cell.image.place.request',
    TATICAL_CELL_IMAGE_PLACE_BROADCAST = 'tatical.cell.image.place.broadcast',

    TATICAL_CELL_IMAGE_REMOVE_REQUEST = 'tatical.cell.image.remove.request',
    TATICAL_CELL_IMAGE_REMOVE_BROADCAST = 'tatical.cell.image.remove.broadcast',

    TATICAL_CELL_IMAGE_MAP_RESET_REQUEST = 'tatical.cell.image_map.reset.request',
    TATICAL_CELL_IMAGE_MAP_RESET_BROADCAST = 'tatical.cell.image_map.reset.broadcast',

    TATICAL_CELL_IMAGE_MAP_STATE_REQUEST = 'tatical.cell.image_map.state.request',
    TATICAL_CELL_IMAGE_MAP_STATE_SYNC_SELF = 'tatical.cell.image_map.state.sync.self',
}

export function registerTaticalSocket(io: Server, socket: Socket, roomStateManager: RoomStateManager) {
    socket.on(`${SocketEvent.TATICAL_CELL_IMAGE_PLACE_REQUEST}`, ({ teamId, imgId, cellId }: { teamId: number; imgId: string; cellId: string }) => {
        logger.info(`Received ${SocketEvent.TATICAL_CELL_IMAGE_PLACE_REQUEST} teamId: ${teamId} imgId: ${imgId} cellId: ${cellId}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        roomState.teamTaticalBoardMap[teamId][cellId] = imgId;
        socket.to(roomId).emit(`${SocketEvent.TATICAL_CELL_IMAGE_PLACE_BROADCAST}`, { teamId, imgId, cellId });
        logger.info(`Sent ${SocketEvent.TATICAL_CELL_IMAGE_PLACE_BROADCAST} teamId: ${teamId} imgId: ${imgId} cellId: ${cellId}`);
    });

    socket.on(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_REQUEST}`, ({ teamId, cellId }: { teamId: number; cellId: string }) => {
        logger.info(`Received ${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_REQUEST} teamId: ${teamId} cellId: ${cellId}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        delete roomState.teamTaticalBoardMap[teamId][cellId];
        socket.to(roomId).emit(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_BROADCAST}`, { teamId, cellId });
        logger.info(`Sent ${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_BROADCAST} teamId: ${teamId} cellId: ${cellId}`);
    });

    socket.on(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_RESET_REQUEST}`, ({ teamId }: { teamId: number }) => {
        logger.info(`Received ${SocketEvent.TATICAL_CELL_IMAGE_MAP_RESET_REQUEST} teamId: ${teamId}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        roomState.teamTaticalBoardMap[teamId] = {};
        socket.to(roomId).emit(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_RESET_BROADCAST}`, { teamId });
        logger.info(`Sent ${SocketEvent.TATICAL_CELL_IMAGE_MAP_RESET_BROADCAST} teamId: ${teamId}`);
    });

    socket.on(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_STATE_REQUEST}`, ({ teamId }: { teamId: number }) => {
        logger.info(`Received ${SocketEvent.TATICAL_CELL_IMAGE_MAP_STATE_REQUEST}`);
        const roomId = (socket as any).roomId;
        syncTaticalCellImageMapStateSelf(socket, roomId, roomStateManager, teamId);
    });
}

export function syncTaticalCellImageMapStateSelf(socket: Socket, roomId: string, roomStateManager: RoomStateManager, teamId: number) {
    const taticalCellImageMap = roomStateManager.getTeamTaticalBoardMap(roomId)[teamId];
    socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_STATE_SYNC_SELF}`, { teamId, taticalCellImageMap });
    logger.info(`Sent ${SocketEvent.TATICAL_CELL_IMAGE_MAP_STATE_SYNC_SELF}`, teamId, taticalCellImageMap);
}

export function syncTaticalCellImageMapStateOther(
    roomUser: IRoomUser,
    io: Server,
    roomId: string,
    roomStateManager: RoomStateManager,
    teamId: number,
) {
    const taticalCellImageMap = roomStateManager.getTeamTaticalBoardMap(roomId)[teamId];
    io.to(roomUser.id).emit(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_STATE_SYNC_SELF}`, { teamId, taticalCellImageMap });
    logger.info(`Sent ${SocketEvent.TATICAL_CELL_IMAGE_MAP_STATE_SYNC_SELF}`, roomUser, teamId, taticalCellImageMap);
}
