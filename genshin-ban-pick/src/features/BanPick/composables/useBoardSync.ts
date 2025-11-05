// src/features/BanPick/composables/useBoardSync.vue

import { readonly, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useBanPickStepSync } from './useBanPickStepSync';
import { useSocketStore } from '@/stores/socketStore';
import { useBoardImageStore } from '@/stores/boardImageStore';
import { useTacticalBoardSync } from '@/features/Tactical/composables/useTacticalBoardSync';
import { ZoneType } from '@/types/IZone';

enum SocketEvent {
    BOARD_IMAGE_DROP_REQUEST = 'board.image.drop.request',
    BOARD_IMAGE_DROP_BROADCAST = 'board.image.drop.broadcast',

    BOARD_IMAGE_RESTORE_REQUEST = 'board.image.restore.request',
    BOARD_IMAGE_RESTORE_BROADCAST = 'board.image.restore.broadcast',

    BOARD_IMAGE_MAP_RESET_REQUEST = 'board.image_map.reset.request',
    BOARD_IMAGE_MAP_RESET_BROADCAST = 'board.image_map.reset.broadcast',

    BOARD_IMAGE_MAP_STATE_SYNC_SELF = 'board.image_map.state.sync.self',
}

export function useBoardSync() {
    const socket = useSocketStore().getSocket();
    const boardImageStore = useBoardImageStore();
    const { zoneMetaTable, boardImageMap, usedImageIds } = storeToRefs(boardImageStore);
    const { setBoardImageMap, placeBoardImage, removeBoardImage, resetBoardImageMap, findZoneIdByImageId } = boardImageStore;

    const { currentStep, banPickSteps, advanceStep, resetStep } = useBanPickStepSync();

    const {
        handleAddImageToPool,
        handleRemoveImageFromBoard,
        handleAllTeamAddImageToPool,
        handleAllTeamRemoveImageFromBoard,
        handleAllTeamResetBoard,
    } = useTacticalBoardSync();

    function handleBoardImageDrop({ zoneId, imgId }: { zoneId: number; imgId: string }) {
        console.log(`[BOARD SYNC] Handle image drop`, { zoneId, imgId });
        const previousZoneId = findZoneIdByImageId(imgId);
        const displacedZoneImgId = boardImageMap.value[zoneId] ?? null;

        if (previousZoneId !== null && displacedZoneImgId !== null && previousZoneId !== zoneId) {
            swapImages(zoneId, previousZoneId, imgId, displacedZoneImgId);
            console.debug('[BOARD SYNC] Sent board image restore request', { zoneId: previousZoneId });
            console.debug('[BOARD SYNC] Sent board image restore request', { zoneId });
            console.debug('[BOARD SYNC] Sent board image drop request', { zoneId, imgId });
            console.debug('[BOARD SYNC] Sent board image drop request', { zoneId: previousZoneId, imgId: displacedZoneImgId });
            socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId: previousZoneId });
            socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId });
            socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { zoneId, imgId });
            socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { zoneId: previousZoneId, imgId: displacedZoneImgId });
        } else {
            if (previousZoneId !== null) {
                removeImage(previousZoneId);

                console.debug('[BOARD SYNC] Sent board image restore request', { zoneId: previousZoneId });
                socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId: previousZoneId });
            } else if (displacedZoneImgId !== null) {
                removeImage(zoneId);

                console.debug('[BOARD SYNC] Sent board image restore request', { zoneId });
                socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId });
            }
            placeImage(zoneId, imgId);

            console.debug('[BOARD SYNC] Sent board image drop request', { zoneId, imgId });
            socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { zoneId, imgId });

            if (currentStep.value?.zoneId === zoneId) {
                advanceStep();
            }
        }
    }

    function handleBoardImageRestore({ zoneId }: { zoneId: number }) {
        console.debug('[BOARD SYNC] Handle board image restore broadcast', { zoneId });
        removeImage(zoneId);
        console.debug('[BOARD SYNC] Sent board image restore request', { zoneId });
        socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId });
    }

    function handleBoardImageMapReset() {
        console.debug('[BOARD SYNC] Handle board image reset');
        resetBoardImageMap();
        handleAllTeamResetBoard();

        console.debug('[BOARD SYNC] Sent board image reset request');
        socket.emit(`${SocketEvent.BOARD_IMAGE_MAP_RESET_REQUEST}`);
        resetStep();
    }

    function handleBoardRecord() {
        const grouped: Record<'ban' | 'pick' | 'utility' | 'other', Record<string, string>> = {
            ban: {},
            pick: {},
            utility: {},
            other: {},
        };

        // for (const [zoneId, charId] of Object.entries(boardImageMap.value)) {
        //   if (zoneId.startsWith('zone-ban')) grouped.ban[zoneId] = charId
        //   else if (zoneId.startsWith('zone-pick')) grouped.pick[zoneId] = charId
        //   else if (zoneId.startsWith('zone-utility')) grouped.utility[zoneId] = charId
        //   else grouped.other[zoneId] = charId
        // }

        // console.log('Grouped BanPick Data:', grouped)
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

    onMounted(() => {
        console.debug('[BOARD SYNC] On mounted');
        socket.on(`${SocketEvent.BOARD_IMAGE_MAP_STATE_SYNC_SELF}`, handleBoradImageMapStateSync);
        socket.on(`${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`, handleBoardImageDropBroadcast);
        socket.on(`${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`, handleBoardImageRestoreBroadcast);
        socket.on(`${SocketEvent.BOARD_IMAGE_MAP_RESET_BROADCAST}`, handleBoardImageMapResetBroadcast);
    });

    onUnmounted(() => {
        console.debug('[BOARD SYNC] On unmounted');
        socket.off(`${SocketEvent.BOARD_IMAGE_MAP_STATE_SYNC_SELF}`);
        socket.off(`${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`);
        socket.off(`${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`);
        socket.off(`${SocketEvent.BOARD_IMAGE_MAP_RESET_BROADCAST}`);
    });

    function getTeamIdFromZoneId(zoneId: number) {
        const match = banPickSteps.value.find((f) => f.zoneId === zoneId);
        return match?.teamId;
    }

    function cloneToTacticalPoolIfNeeded(zoneId: number, imgId: string) {
        const zone = zoneMetaTable.value[zoneId];
        switch (zone.type) {
            case ZoneType.PICK:
                const teamId = getTeamIdFromZoneId(zoneId);
                if (teamId !== undefined) {
                    handleAddImageToPool(teamId, imgId);
                }
                break;
            case ZoneType.BAN:
                break;
            case ZoneType.UTILITY:
                handleAllTeamAddImageToPool(imgId);
                break;
        }
    }

    function removeFromTacticalBoardIfNeeded(zoneId: number, imgId: string) {
        const zone = zoneMetaTable.value[zoneId];
        switch (zone.type) {
            case ZoneType.PICK:
                const teamId = getTeamIdFromZoneId(zoneId);
                if (teamId !== undefined) {
                    handleRemoveImageFromBoard(teamId, imgId);
                }
                break;
            case ZoneType.BAN:
                break;
            case ZoneType.UTILITY:
                handleAllTeamRemoveImageFromBoard(imgId);
                break;
        }
    }

    return {
        boardImageMap: readonly(boardImageMap),
        usedImageIds,
        handleBoardImageDrop,
        handleBoardImageRestore,
        handleBoardImageMapReset,
        handleBoardRecord,
    };
}
