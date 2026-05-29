// src/modules/board/sync/useBoardSync.ts

import { useSocketStore } from '@/app/stores/socketStore';
import { useBoardUseCase } from '../ui/composables/useBoardUseCase';
import { createLogger } from '@/app/utils/logger';
import { BoardEvent } from '@shared/contracts/board/value-types';

import type { ICharacterRandomContext } from '@shared/contracts/character/ICharacterRandomContext';

const logger = createLogger('board.sync');

export function useBoardSync() {
    const socket = useSocketStore().getSocket();
    const boardUseCase = useBoardUseCase();

    function registerBoardSync() {
        socket.on(`${BoardEvent.ImageMapStateSyncSelf}`, handleBoardImageMapStateSync);
        socket.on(`${BoardEvent.ImageDropBroadcast}`, handleBoardImageDropBroadcast);
        socket.on(`${BoardEvent.ImageRestoreBroadcast}`, handleBoardImageRestoreBroadcast);
        socket.on(`${BoardEvent.ImageMapResetBroadcast}`, handleBoardImageMapResetBroadcast);
    }

    function fetchBoardImageMapState() {
        logger.debug('sent image map state request');
        socket.emit(`${BoardEvent.ImageMapStateRequest}`);
    }

    function boardImageDrop({ zoneId, imgId, randomContext }: { zoneId: number; imgId: string; randomContext?: ICharacterRandomContext }) {
        logger.debug('image drop', { zoneId, imgId, randomContext });
        boardUseCase.handleBoardImageDrop(zoneId, imgId);

        logger.debug('sent image drop request', { zoneId, imgId });
        socket.emit(`${BoardEvent.ImageDropRequest}`, { zoneId, imgId, randomContext });
    }

    function boardImageRestore({ zoneId }: { zoneId: number }) {
        logger.debug('image restore', zoneId);
        boardUseCase.handleBoardImageRestore(zoneId);

        logger.debug('sent image restore request', zoneId);
        socket.emit(`${BoardEvent.ImageRestoreRequest}`, { zoneId });
    }

    function boardImageMapReset() {
        logger.debug('image map reset');
        boardUseCase.handleBoardImageMapReset();

        logger.debug('sent image map reset request');
        socket.emit(`${BoardEvent.ImageMapResetRequest}`);
    }

    function handleBoardImageDropBroadcast({ zoneId, imgId }: { zoneId: number; imgId: string }) {
        logger.debug('image drop broadcast', { zoneId, imgId });
        boardUseCase.handleBoardImageDrop(zoneId, imgId);
    }

    function handleBoardImageRestoreBroadcast({ zoneId }: { zoneId: number }) {
        logger.debug('image restore broadcast', { zoneId });
        boardUseCase.handleBoardImageRestore(zoneId);
    }

    function handleBoardImageMapResetBroadcast() {
        logger.debug('image map reset broadcast');
        boardUseCase.handleBoardImageMapReset();
    }

    function handleBoardImageMapStateSync(imageMap: Record<number, string>) {
        logger.debug('image map state sync', imageMap);
        boardUseCase.setBoardImageMap(imageMap);
    }

    return {
        registerBoardSync,
        fetchBoardImageMapState,
        boardImageDrop,
        boardImageRestore,
        boardImageMapReset,
    };
}
