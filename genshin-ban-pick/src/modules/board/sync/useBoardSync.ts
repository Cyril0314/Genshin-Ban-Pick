// src/modules/board/sync/useBoardSync.ts

import { readonly } from 'vue';
import { storeToRefs } from 'pinia';

import { useSocketStore } from '@/app/stores/socketStore';
import { useBoardImageStore } from '../store/boardImageStore';
import { useMatchStepSync } from './useMatchStepSync';
import { useTacticalBoardSync } from '@/modules/tactical';
import { ZoneType } from '../types/IZone';

import type { ICharacterRandomContext } from '../types/ICharacterRandomContext';

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
    const boardImageStore = useBoardImageStore();
    const { zoneMetaTable, boardImageMap, usedImageIds } = storeToRefs(boardImageStore);
    const { setBoardImageMap, placeBoardImage, removeBoardImage, resetBoardImageMap, findZoneIdByImageId } = boardImageStore;

    const { currentStep, matchSteps, advanceStep, resetStep } = useMatchStepSync();

    const {
        handleAddImageToPool,
        handleRemoveImageFromBoard,
        handleAllTeamAddImageToPool,
        handleAllTeamRemoveImageFromBoard,
        handleAllTeamResetBoard,
    } = useTacticalBoardSync();

    function registerBoardSync() {
        socket.on(`${BoardEvent.ImageMapStateSyncSelf}`, handleBoradImageMapStateSync);
        socket.on(`${BoardEvent.ImageDropBroadcast}`, handleBoardImageDropBroadcast);
        socket.on(`${BoardEvent.ImageRestoreBroadcast}`, handleBoardImageRestoreBroadcast);
        socket.on(`${BoardEvent.ImageMapResetBroadcast}`, handleBoardImageMapResetBroadcast);
    }

    function handleBoardImageDrop({ zoneId, imgId, randomContext }: { zoneId: number; imgId: string; randomContext?: ICharacterRandomContext }) {
        console.log(`[BOARD SYNC] Handle image drop`, { zoneId, imgId, randomContext });
        const previousZoneId = findZoneIdByImageId(imgId);
        const displacedZoneImgId = boardImageMap.value[zoneId] ?? null;

        if (previousZoneId !== null) {
            removeImage(previousZoneId);
        }

        if (displacedZoneImgId !== null) {
            removeImage(zoneId);
        }

        if (previousZoneId !== null && displacedZoneImgId !== null && previousZoneId !== zoneId) {
            placeImage(previousZoneId, displacedZoneImgId);
        }

        placeImage(zoneId, imgId);

        console.debug('[BOARD SYNC] Sent board image drop request', { zoneId, imgId });
        socket.emit(`${BoardEvent.ImageDropRequest}`, { zoneId, imgId, randomContext });

        if (currentStep.value?.zoneId === zoneId) {
            advanceStep();
        }
    }

    function handleBoardImageRestore({ zoneId }: { zoneId: number }) {
        console.debug('[BOARD SYNC] Handle board image restore broadcast', { zoneId });
        removeImage(zoneId);
        console.debug('[BOARD SYNC] Sent board image restore request', { zoneId });
        socket.emit(`${BoardEvent.ImageRestoreRequest}`, { zoneId });
    }

    function handleBoardImageMapReset() {
        console.debug('[BOARD SYNC] Handle board image reset');
        resetBoardImageMap();
        handleAllTeamResetBoard();

        console.debug('[BOARD SYNC] Sent board image reset request');
        socket.emit(`${BoardEvent.ImageMapResetRequest}`);
        resetStep();
    }

    function handleBoardImageDropBroadcast({ zoneId, imgId }: { zoneId: number; imgId: string }) {
        console.debug('[BOARD SYNC] Handle board image drop broadcast', { zoneId, imgId });
        placeImage(zoneId, imgId);
    }

    function handleBoardImageRestoreBroadcast({ zoneId }: { zoneId: number }) {
        console.debug('[BOARD SYNC] Handle board image restore broadcast', { zoneId });
        removeImage(zoneId);
    }

    function handleBoardImageMapResetBroadcast() {
        console.debug('[BOARD SYNC] Handle board image reset broadcast');
        resetBoardImageMap();
        handleAllTeamResetBoard();
    }

    function handleBoradImageMapStateSync(imageMap: Record<number, string>) {
        console.debug('[BOARD SYNC] Handle board image map state sync', imageMap);
        setBoardImageMap(imageMap);
        for (const [key, value] of Object.entries(boardImageMap.value)) {
            const zoneId = Number(key);
            cloneToTacticalPoolIfNeeded(zoneId, value);
        }
    }

    function swapImages(zoneId: number, previousZoneId: number, imgId: string, displacedImgId: string) {
        removeImage(previousZoneId);
        removeImage(zoneId);
        placeImage(zoneId, imgId);
        placeImage(previousZoneId, displacedImgId);
    }

    function placeImage(zoneId: number, imgId: string) {
        placeBoardImage(zoneId, imgId);
        cloneToTacticalPoolIfNeeded(zoneId, imgId);
    }

    function removeImage(zoneId: number) {
        const imgId = boardImageMap.value[zoneId];
        removeBoardImage(zoneId);
        removeFromTacticalBoardIfNeeded(zoneId, imgId);
    }

    function getTeamSlotFromZoneId(zoneId: number) {
        const match = matchSteps.value.find((f) => f.zoneId === zoneId);
        return match?.teamSlot ?? null;
    }

    function cloneToTacticalPoolIfNeeded(zoneId: number, imgId: string) {
        const zone = zoneMetaTable.value[zoneId];
        switch (zone.type) {
            case ZoneType.Pick:
                const teamSlot = getTeamSlotFromZoneId(zoneId);
                if (teamSlot !== null) {
                    handleAddImageToPool(teamSlot, imgId);
                }
                break;
            case ZoneType.Ban:
                break;
            case ZoneType.Utility:
                handleAllTeamAddImageToPool(imgId);
                break;
        }
    }

    function removeFromTacticalBoardIfNeeded(zoneId: number, imgId: string) {
        const zone = zoneMetaTable.value[zoneId];
        switch (zone.type) {
            case ZoneType.Pick:
                const teamSlot = getTeamSlotFromZoneId(zoneId);
                if (teamSlot !== null) {
                    handleRemoveImageFromBoard(teamSlot, imgId);
                }
                break;
            case ZoneType.Ban:
                break;
            case ZoneType.Utility:
                handleAllTeamRemoveImageFromBoard(imgId);
                break;
        }
    }

    return {
        boardImageMap: readonly(boardImageMap),
        usedImageIds,
        registerBoardSync,
        handleBoardImageDrop,
        handleBoardImageRestore,
        handleBoardImageMapReset,
    };
}
