// backend/src/socket/modules/boardSocket.ts

import { Server, Socket } from 'socket.io';

import { logger } from '../../utils/logger.ts';

enum SocketEvent {
    BOARD_IMAGE_DROP_REQUEST = 'board.image.drop.request',
    BOARD_IMAGE_DROP_BROADCAST = 'board.image.drop.broadcast',

    BOARD_IMAGE_RESTORE_REQUEST = 'board.image.restore.request',
    BOARD_IMAGE_RESTORE_BROADCAST = 'board.image.restore.broadcast',

    BOARD_IMAGES_RESET_REQUEST = 'board.images.reset.request',
    BOARD_IMAGES_RESET_BROADCAST = 'board.images.reset.broadcast',

    BOARD_IMAGES_STATE_SYNC = 'board.images.state.sync',
}

type RoomId = string;
type BoardImageMap = Record<string, string>;

export const boardImagesState: Record<RoomId, BoardImageMap> = {};

export function registerBoardSocket(io: Server, socket: Socket) {
    socket.on(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, ({ imgId, zoneId, senderId }: { imgId: string; zoneId: string; senderId: string }) => {
        logger.info(`Received ${SocketEvent.BOARD_IMAGE_DROP_REQUEST} imgId: ${imgId} zoneId: ${zoneId} senderId: ${senderId}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const who = socket.data.userId ?? socket.data.guestId;
        console.log(`[Socket] image.drop.request from:`, who);

        boardImagesState[roomId] ||= {};
        boardImagesState[roomId][zoneId] = imgId;
        socket.to(roomId).emit(`${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`, { imgId, zoneId, senderId });
        logger.info(`Sent ${SocketEvent.BOARD_IMAGE_DROP_BROADCAST} imgId: ${imgId} zoneId: ${zoneId} senderId: ${senderId}`);
    });

    socket.on(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, ({ zoneId, senderId }: { zoneId: string; senderId: string }) => {
        logger.info(`Received ${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST} zoneId: ${zoneId} senderId: ${senderId}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        boardImagesState[roomId] ||= {};
        delete boardImagesState[roomId][zoneId];
        socket.to(roomId).emit(`${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`, { zoneId, senderId });
        logger.info(`Sent ${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST} zoneId: ${zoneId} senderId: ${senderId}`);
    });

    socket.on(`${SocketEvent.BOARD_IMAGES_RESET_REQUEST}`, ({ senderId }: { senderId: string }) => {
        logger.info(`Received ${SocketEvent.BOARD_IMAGES_RESET_REQUEST} senderId: ${senderId}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        boardImagesState[roomId] = {};
        socket.to(roomId).emit(`${SocketEvent.BOARD_IMAGES_RESET_BROADCAST}`, { senderId });
        logger.info(`Sent ${SocketEvent.BOARD_IMAGES_RESET_BROADCAST} senderId: ${senderId}`);
    });
}

export function syncBoardState(socket: Socket, roomId: RoomId) {
    const boardImages = boardImagesState[roomId] || {}
    socket.emit(`${SocketEvent.BOARD_IMAGES_STATE_SYNC}`, boardImages);
    logger.info(`Sent ${SocketEvent.BOARD_IMAGES_STATE_SYNC} boardImages: ${JSON.stringify(boardImages, null, 2)}`);
}
