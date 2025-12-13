// src/modules/board/sync/useBoardSync.ts

import { useSocketStore } from '@/app/stores/socketStore';
import { useBoardUseCase } from '../ui/composables/useBoardUseCase';
import { useTacticalBoardSync } from '@/modules/tactical';
import { BoardEvent } from '@shared/contracts/board/value-types';

import type { ICharacterRandomContext } from '@shared/contracts/character/ICharacterRandomContext';

export function useBoardSync() {
    const socket = useSocketStore().getSocket();
    const boardUseCase = useBoardUseCase();

    const { handleAllTeamResetBoard } = useTacticalBoardSync();

    function registerBoardSync() {
        socket.on(`${BoardEvent.ImageMapStateSyncSelf}`, handleBoardImageMapStateSync);
        socket.on(`${BoardEvent.ImageDropBroadcast}`, handleBoardImageDropBroadcast);
        socket.on(`${BoardEvent.ImageRestoreBroadcast}`, handleBoardImageRestoreBroadcast);
        socket.on(`${BoardEvent.ImageMapResetBroadcast}`, handleBoardImageMapResetBroadcast);
    }

    function fetchBoardImageMapState() {
        console.debug('[BOARD SYNC] Sent board image map state request');
        socket.emit(`${BoardEvent.ImageMapStateRequest}`);
    }

    function boardImageDrop({ zoneId, imgId, randomContext }: { zoneId: number; imgId: string; randomContext?: ICharacterRandomContext }) {
        console.log(`[BOARD SYNC] Handle image drop`, { zoneId, imgId, randomContext });
        boardUseCase.handleBoardImageDrop(zoneId, imgId);

        console.debug('[BOARD SYNC] Sent board image drop request', { zoneId, imgId });
        socket.emit(`${BoardEvent.ImageDropRequest}`, { zoneId, imgId, randomContext });
    }

    function boardImageRestore({ zoneId }: { zoneId: number }) {
        console.debug('[BOARD SYNC] Handle board image restore', zoneId);
        boardUseCase.handleBoardImageRestore(zoneId);

        console.debug('[BOARD SYNC] Sent board image restore request', zoneId);
        socket.emit(`${BoardEvent.ImageRestoreRequest}`, { zoneId });
    }

    function boardImageMapReset() {
        console.debug('[BOARD SYNC] Handle board image reset');
        boardUseCase.handleBoardImageMapReset();
        handleAllTeamResetBoard();

        console.debug('[BOARD SYNC] Sent board image reset request');
        socket.emit(`${BoardEvent.ImageMapResetRequest}`);
    }

    function handleBoardImageDropBroadcast({ zoneId, imgId }: { zoneId: number; imgId: string }) {
        console.debug('[BOARD SYNC] Handle board image drop broadcast', { zoneId, imgId });
        boardUseCase.handleBoardImageDrop(zoneId, imgId);
    }

    function handleBoardImageRestoreBroadcast({ zoneId }: { zoneId: number }) {
        console.debug('[BOARD SYNC] Handle board image restore broadcast', { zoneId });
        boardUseCase.handleBoardImageRestore(zoneId);
    }

    function handleBoardImageMapResetBroadcast() {
        console.debug('[BOARD SYNC] Handle board image reset broadcast');
        boardUseCase.handleBoardImageMapReset();
        handleAllTeamResetBoard();
    }

    function handleBoardImageMapStateSync(imageMap: Record<number, string>) {
        console.debug('[BOARD SYNC] Handle board image map state sync', imageMap);
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
