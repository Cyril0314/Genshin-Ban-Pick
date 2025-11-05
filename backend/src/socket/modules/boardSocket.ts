// backend/src/socket/modules/boardSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../utils/logger.ts';
import { RoomStateManager } from '../managers/RoomStateManager.ts';
import { IRoomStateManager } from '../managers/IRoomStateManager.ts';

const logger = createLogger('BOARD SOCKET')

enum BoardEvent {
    ImageDropRequest = 'board.image.drop.request',
    ImageDropBroadcast = 'board.image.drop.broadcast',

    ImageRestoreRequest = 'board.image.restore.request',
    ImageRestoreBroadcast = 'board.image.restore.broadcast',

    ImageMapResetRequest = 'board.image_map.reset.request',
    ImageMapResetBroadcast = 'board.image_map.reset.broadcast',

    ImageMapStateSyncSelf = 'board.image_map.state.sync.self',
}


export function registerBoardSocket(io: Server, socket: Socket, roomStateManager: IRoomStateManager) {
    socket.on(`${BoardEvent.ImageDropRequest}`, ({ zoneId, imgId }: { zoneId: number; imgId: string }) => {
        logger.info(`Received ${BoardEvent.ImageDropRequest}`, { zoneId, imgId });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId)
        roomState.boardImageMap[zoneId] = imgId;
        socket.to(roomId).emit(`${BoardEvent.ImageDropBroadcast}`, { zoneId, imgId });
        logger.info(`Sent ${BoardEvent.ImageDropBroadcast}`, { zoneId, imgId });
    });

    socket.on(`${BoardEvent.ImageRestoreRequest}`, ({ zoneId }: { zoneId: number }) => {
        logger.info(`Received ${BoardEvent.ImageRestoreRequest} zoneId: ${zoneId}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        delete roomState.boardImageMap[zoneId];
        socket.to(roomId).emit(`${BoardEvent.ImageRestoreBroadcast}`, { zoneId });
        logger.info(`Sent ${BoardEvent.ImageRestoreBroadcast}`, { zoneId });
    });

    socket.on(`${BoardEvent.ImageMapResetRequest}`, () => {
        logger.info(`Received ${BoardEvent.ImageMapResetRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        roomState.boardImageMap = {};
        socket.to(roomId).emit(`${BoardEvent.ImageMapResetBroadcast}`);
        logger.info(`Sent ${BoardEvent.ImageMapResetBroadcast}`);
    });
}

export function syncBoardImageMapStateSelf(socket: Socket, roomId: string, roomStateManager: IRoomStateManager) {
    const boardImageMap = roomStateManager.getBoardImageMap(roomId);
    socket.emit(`${BoardEvent.ImageMapStateSyncSelf}`, boardImageMap);
    logger.info(`Sent ${BoardEvent.ImageMapStateSyncSelf}`, boardImageMap);
}