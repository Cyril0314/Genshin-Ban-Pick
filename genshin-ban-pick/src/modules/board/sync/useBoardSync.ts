// src/modules/board/sync/useBoardSync.ts

import { boardUseCase } from '../application/boardUseCase';
import { useSocketStore } from '@/app/stores/socketStore';
import { useMatchStepSync } from './useMatchStepSync';
import { useTacticalBoardSync } from '@/modules/tactical';
import { useMatchStepStore } from '../store/matchStepStore';

import type { ICharacterRandomContext } from '@shared/contracts/character/ICharacterRandomContext';

enum BoardEvent {
    ImageDropRequest = 'board.image.drop.request',
    ImageDropBroadcast = 'board.image.drop.broadcast',

    ImageRestoreRequest = 'board.image.restore.request',
    ImageRestoreBroadcast = 'board.image.restore.broadcast',

    ImageMapResetRequest = 'board.image_map.reset.request',
    ImageMapResetBroadcast = 'board.image_map.reset.broadcast',

    ImageMapStateSyncSelf = 'board.image_map.state.sync.self',
}

export function useBoardSync() {
    const socket = useSocketStore().getSocket();
    const { handleBoardImageDrop, handleBoardImageRestore, handleBoardImageMapReset, setBoardImageMap } = boardUseCase();
    const { advanceStep, resetStep } = useMatchStepSync();
    const { handleAllTeamResetBoard } = useTacticalBoardSync();

    const matchStepStore = useMatchStepStore();

    function registerBoardSync() {
        socket.on(`${BoardEvent.ImageMapStateSyncSelf}`, handleBoradImageMapStateSync);
        socket.on(`${BoardEvent.ImageDropBroadcast}`, handleBoardImageDropBroadcast);
        socket.on(`${BoardEvent.ImageRestoreBroadcast}`, handleBoardImageRestoreBroadcast);
        socket.on(`${BoardEvent.ImageMapResetBroadcast}`, handleBoardImageMapResetBroadcast);
    }

    function boardImageDrop({ zoneId, imgId, randomContext }: { zoneId: number; imgId: string; randomContext?: ICharacterRandomContext }) {
        console.log(`[BOARD SYNC] Handle image drop`, { zoneId, imgId, randomContext });
        handleBoardImageDrop(zoneId, imgId);

        console.debug('[BOARD SYNC] Sent board image drop request', { zoneId, imgId });
        socket.emit(`${BoardEvent.ImageDropRequest}`, { zoneId, imgId, randomContext });

        if (matchStepStore.currentStep?.zoneId === zoneId) {
            advanceStep();
        }
    }

    function boardImageRestore({ zoneId }: { zoneId: number }) {
        console.debug('[BOARD SYNC] Handle board image restore', zoneId);
        handleBoardImageRestore(zoneId);

        console.debug('[BOARD SYNC] Sent board image restore request', zoneId);
        socket.emit(`${BoardEvent.ImageRestoreRequest}`, { zoneId });
    }

    function boardImageMapReset() {
        console.debug('[BOARD SYNC] Handle board image reset');
        handleBoardImageMapReset();
        handleAllTeamResetBoard();

        console.debug('[BOARD SYNC] Sent board image reset request');
        socket.emit(`${BoardEvent.ImageMapResetRequest}`);
        resetStep();
    }

    function handleBoardImageDropBroadcast({ zoneId, imgId }: { zoneId: number; imgId: string }) {
        console.debug('[BOARD SYNC] Handle board image drop broadcast', { zoneId, imgId });
        handleBoardImageDrop(zoneId, imgId);
    }

    function handleBoardImageRestoreBroadcast({ zoneId }: { zoneId: number }) {
        console.debug('[BOARD SYNC] Handle board image restore broadcast', { zoneId });
        handleBoardImageRestore(zoneId);
    }

    function handleBoardImageMapResetBroadcast() {
        console.debug('[BOARD SYNC] Handle board image reset broadcast');
        handleBoardImageMapReset();
        handleAllTeamResetBoard();
    }

    function handleBoradImageMapStateSync(imageMap: Record<number, string>) {
        console.debug('[BOARD SYNC] Handle board image map state sync', imageMap);
        setBoardImageMap(imageMap);
    }

    return {
        registerBoardSync,
        boardImageDrop,
        boardImageRestore,
        boardImageMapReset,
    };
}
