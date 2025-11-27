// backend/src/modules/socket/modules/boardSocket.ts

import { Server, Socket } from 'socket.io';

import { createLogger } from '../../../utils/logger';
import IRoomStateManager from '../domain/IRoomStateManager';
import { ICharacterRandomContext } from '@shared/contracts/character/ICharacterRandomContext';
import { BoardImageMap } from '@shared/contracts/board/BoardImageMap';

const logger = createLogger('BOARD SOCKET');

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
    socket.on(
        `${BoardEvent.ImageDropRequest}`,
        ({ zoneId, imgId, randomContext }: { zoneId: number; imgId: string; randomContext?: ICharacterRandomContext }) => {
            logger.info(`Received ${BoardEvent.ImageDropRequest}`, { zoneId, imgId, randomContext });
            const roomId = (socket as any).roomId;
            if (!roomId) return;

            const roomState = roomStateManager.get(roomId);
            if (!roomState) return;

            const previousZoneId = findZoneIdByImageId(roomState.boardImageMap, imgId);
            const displacedZoneImgId = roomState.boardImageMap[zoneId] ?? null;

            // 從別的格子拖曳進來
            if (previousZoneId !== null) {
                delete roomState.boardImageMap[previousZoneId];
            }

            const previousRandomContext = displacedZoneImgId === null ? null : roomState.characterRandomContextMap[displacedZoneImgId];

            // 拖曳進來的格子有圖片
            if (displacedZoneImgId !== null) {
                delete roomState.boardImageMap[zoneId];
            }

            // 將目標格子的圖片轉移到拖曳前的格子
            if (previousZoneId !== null && displacedZoneImgId !== null && previousZoneId !== zoneId) {
                roomState.boardImageMap[previousZoneId] = displacedZoneImgId;
            }

            roomState.boardImageMap[zoneId] = imgId;
            socket.to(roomId).emit(`${BoardEvent.ImageDropBroadcast}`, { zoneId, imgId });
            logger.info(`Sent ${BoardEvent.ImageDropBroadcast}`, { zoneId, imgId });

            if (randomContext) {
                roomState.characterRandomContextMap[imgId] = randomContext;
                logger.info(`Add random context`, imgId, randomContext);
            }

            if (previousRandomContext && displacedZoneImgId !== null && !findZoneIdByImageId(roomState.boardImageMap, displacedZoneImgId)) {
                delete roomState.characterRandomContextMap[displacedZoneImgId];
                logger.info(`Remove random context`, displacedZoneImgId, previousRandomContext);
            }
        },
    );

    socket.on(`${BoardEvent.ImageRestoreRequest}`, ({ zoneId }: { zoneId: number }) => {
        logger.info(`Received ${BoardEvent.ImageRestoreRequest} zoneId: ${zoneId}`);
        const roomId = (socket as any).roomId;
        if (!roomId) return;

        const roomState = roomStateManager.get(roomId);
        if (!roomState) return;

        const imgId = roomState.boardImageMap[zoneId];
        delete roomState.boardImageMap[zoneId];
        delete roomState.characterRandomContextMap[imgId];
        socket.to(roomId).emit(`${BoardEvent.ImageRestoreBroadcast}`, { zoneId });
        logger.info(`Sent ${BoardEvent.ImageRestoreBroadcast}`, { zoneId });
    });

    socket.on(`${BoardEvent.ImageMapResetRequest}`, () => {
        logger.info(`Received ${BoardEvent.ImageMapResetRequest}`);
        const roomId = (socket as any).roomId;
        

        const roomState = roomStateManager.get(roomId);
        if (!roomState) return;

        roomState.boardImageMap = {};
        roomState.characterRandomContextMap = {};
        socket.to(roomId).emit(`${BoardEvent.ImageMapResetBroadcast}`);
        logger.info(`Sent ${BoardEvent.ImageMapResetBroadcast}`);
    });

    function findZoneIdByImageId(boardImageMap: BoardImageMap, imgId: string): number | null {
        const value = Object.entries(boardImageMap).find(([, f]) => f === imgId);
        if (!value) {
            logger.debug('[BOARD IMAGE STORE] Cannot find zone id by image id', imgId);
            return null;
        }
        logger.debug('[BOARD IMAGE STORE] Find zone id by image id', value[0], imgId);
        return Number(value[0]);
    }
}

export function syncBoardImageMapStateSelf(socket: Socket, roomId: string, roomStateManager: IRoomStateManager) {
    const boardImageMap = roomStateManager.getBoardImageMap(roomId);
    socket.emit(`${BoardEvent.ImageMapStateSyncSelf}`, boardImageMap);
    logger.info(`Sent ${BoardEvent.ImageMapStateSyncSelf}`, boardImageMap);
}
