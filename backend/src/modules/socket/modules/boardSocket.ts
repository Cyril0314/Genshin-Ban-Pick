// backend/src/modules/socket/modules/boardSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger';
import { BoardService } from '../../board';
import { BoardEvent } from '@shared/contracts/board/value-types';

import type { ICharacterRandomContext } from '@shared/contracts/character/ICharacterRandomContext';

const logger = createLogger('socket.board');

export function registerBoardSocket(io: Server, socket: Socket, boardService: BoardService) {
    socket.on(
        `${BoardEvent.ImageDropRequest}`,
        ({ zoneId, imgId, randomContext }: { zoneId: number; imgId: string; randomContext?: ICharacterRandomContext }) => {
            logger.debug(`Received ${BoardEvent.ImageDropRequest}`, { zoneId, imgId, randomContext });
            const roomId = (socket as any).roomId;
            if (!roomId) return;

            boardService.drop(roomId, { zoneId, imgId, randomContext });
            socket.to(roomId).emit(`${BoardEvent.ImageDropBroadcast}`, { zoneId, imgId });
            logger.debug(`Sent ${BoardEvent.ImageDropBroadcast}`, { zoneId, imgId });
        },
    );

    socket.on(`${BoardEvent.ImageRestoreRequest}`, ({ zoneId }: { zoneId: number }) => {
        logger.debug(`Received ${BoardEvent.ImageRestoreRequest} zoneId: ${zoneId}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        boardService.restore(roomId, zoneId);
        socket.to(roomId).emit(`${BoardEvent.ImageRestoreBroadcast}`, { zoneId });
        logger.debug(`Sent ${BoardEvent.ImageRestoreBroadcast}`, { zoneId });
    });

    socket.on(`${BoardEvent.ImageMapResetRequest}`, () => {
        logger.debug(`Received ${BoardEvent.ImageMapResetRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        boardService.reset(roomId);
        socket.to(roomId).emit(`${BoardEvent.ImageMapResetBroadcast}`);
        logger.debug(`Sent ${BoardEvent.ImageMapResetBroadcast}`);
    });

    socket.on(`${BoardEvent.ImageMapStateRequest}`, () => {
        logger.debug(`Received ${BoardEvent.ImageMapStateRequest}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const boardImageMap = boardService.getImageMap(roomId);
        socket.emit(`${BoardEvent.ImageMapStateSyncSelf}`, boardImageMap);
        logger.debug(`Sent ${BoardEvent.ImageMapStateSyncSelf}`, boardImageMap);
    });
}
