// backend/src/socket/modules/boardSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../utils/logger.ts';
import { RoomStateManager } from '../managers/RoomStateManager.ts';

const logger = createLogger('BOARD SOCKET')

enum SocketEvent {
    BOARD_IMAGE_DROP_REQUEST = 'board.image.drop.request',
    BOARD_IMAGE_DROP_BROADCAST = 'board.image.drop.broadcast',

    BOARD_IMAGE_RESTORE_REQUEST = 'board.image.restore.request',
    BOARD_IMAGE_RESTORE_BROADCAST = 'board.image.restore.broadcast',

    BOARD_IMAGE_MAP_RESET_REQUEST = 'board.image_map.reset.request',
    BOARD_IMAGE_MAP_RESET_BROADCAST = 'board.image_map.reset.broadcast',

    BOARD_IMAGE_MAP_STATE_SYNC_SELF = 'board.image_map.state.sync.self',
}

export function registerBoardSocket(io: Server, socket: Socket, roomStateManager: RoomStateManager) {
    socket.on(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, ({ zoneId, imgId }: { zoneId: number; imgId: string }) => {
        logger.info(`Received ${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { zoneId, imgId });
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId)
        roomState.boardImageMap[zoneId] = imgId;
        socket.to(roomId).emit(`${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`, { zoneId, imgId });
        logger.info(`Sent ${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`, { zoneId, imgId });
    });

    socket.on(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, ({ zoneId }: { zoneId: number }) => {
        logger.info(`Received ${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST} zoneId: ${zoneId}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.ensure(roomId);
        delete roomState.boardImageMap[zoneId];
        socket.to(roomId).emit(`${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`, { zoneId });
        logger.info(`Sent ${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`, { zoneId });
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

export function syncBoardImageMapStateSelf(socket: Socket, roomId: string, roomStateManager: RoomStateManager) {
    const boardImageMap = roomStateManager.getBoardImageMap(roomId);
    socket.emit(`${SocketEvent.BOARD_IMAGE_MAP_STATE_SYNC_SELF}`, boardImageMap);
    logger.info(`Sent ${SocketEvent.BOARD_IMAGE_MAP_STATE_SYNC_SELF}`, boardImageMap);
}