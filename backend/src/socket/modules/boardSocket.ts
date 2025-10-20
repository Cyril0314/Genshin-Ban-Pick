// backend/src/socket/modules/boardSocket.ts

import { Server, Socket } from 'socket.io';

import { logger } from '../../utils/logger.ts';
import { RoomStateManager } from '../managers/RoomStateManager.ts';
import { IZoneImageEntry } from '../../types/IZone.ts';

enum SocketEvent {
    BOARD_IMAGE_DROP_REQUEST = 'board.image.drop.request',
    BOARD_IMAGE_DROP_BROADCAST = 'board.image.drop.broadcast',

    BOARD_IMAGE_RESTORE_REQUEST = 'board.image.restore.request',
    BOARD_IMAGE_RESTORE_BROADCAST = 'board.image.restore.broadcast',

    BOARD_IMAGE_MAP_RESET_REQUEST = 'board.image_map.reset.request',
    BOARD_IMAGE_MAP_RESET_BROADCAST = 'board.image_map.reset.broadcast',

    BOARD_IMAGE_MAP_STATE_SYNC = 'board.image_map.state.sync',
}

export function registerBoardSocket(io: Server, socket: Socket, roomStateManager: RoomStateManager) {
    socket.on(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, ({ zoneImageEntry, zoneKey }: { zoneImageEntry: IZoneImageEntry; zoneKey: string }) => {
        logger.info(`Received ${SocketEvent.BOARD_IMAGE_DROP_REQUEST} zoneImageEntry: ${JSON.stringify(zoneImageEntry, null, 2)} zoneKey: ${zoneKey}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const who = socket.data.userId ?? socket.data.guestId;
        console.log(`[Socket] image.drop.request from:`, who);

        const roomState = roomStateManager.ensure(roomId)
        roomState.boardImageMap[zoneKey] = zoneImageEntry;
        socket.to(roomId).emit(`${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`, { zoneImageEntry, zoneKey });
        logger.info(`Sent ${SocketEvent.BOARD_IMAGE_DROP_BROADCAST} zoneImageEntry: ${JSON.stringify(zoneImageEntry, null, 2)} zoneKey: ${zoneKey}`);
    });

    socket.on(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, ({ zoneKey }: { zoneKey: string }) => {
        logger.info(`Received ${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST} zoneKey: ${zoneKey}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        delete roomState.boardImageMap[zoneKey];
        socket.to(roomId).emit(`${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`, { zoneKey });
        logger.info(`Sent ${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST} zone: ${zoneKey}`);
    });

    socket.on(`${SocketEvent.BOARD_IMAGE_MAP_RESET_REQUEST}`, () => {
        logger.info(`Received ${SocketEvent.BOARD_IMAGE_MAP_RESET_REQUEST}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        roomState.boardImageMap = {};
        socket.to(roomId).emit(`${SocketEvent.BOARD_IMAGE_MAP_RESET_BROADCAST}`);
        logger.info(`Sent ${SocketEvent.BOARD_IMAGE_MAP_RESET_BROADCAST}`);
    });
}

export function syncBoardState(socket: Socket, roomId: string, roomStateManager: RoomStateManager) {
    const boardImageMap = roomStateManager.getBoardImageMap(roomId);
    socket.emit(`${SocketEvent.BOARD_IMAGE_MAP_STATE_SYNC}`, boardImageMap);
    logger.info(`Sent ${SocketEvent.BOARD_IMAGE_MAP_STATE_SYNC} boardImageMap: ${JSON.stringify(boardImageMap, null, 2)}`);
}