// src/features/BanPick/composables//useBoardSync.vue

import { readonly, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useBanPickStep } from './useBanPickStep';
import { useTacticalBoardSync } from '@/features/Tactical/composables/useTacticalBoardSync';
import { useSocketStore } from '@/network/socket';
import { useBoardImageStore } from '@/stores/boardImageStore';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { ZoneType } from '@/types/IZone';

import type { ITeam } from '@/types/ITeam';
import type { IZone } from '@/types/IZone';

enum SocketEvent {
    BOARD_IMAGE_DROP_REQUEST = 'board.image.drop.request',
    BOARD_IMAGE_DROP_BROADCAST = 'board.image.drop.broadcast',

    BOARD_IMAGE_RESTORE_REQUEST = 'board.image.restore.request',
    BOARD_IMAGE_RESTORE_BROADCAST = 'board.image.restore.broadcast',

    BOARD_IMAGE_MAP_RESET_REQUEST = 'board.image_map.reset.request',
    BOARD_IMAGE_MAP_RESET_BROADCAST = 'board.image_map.reset.broadcast',

    BOARD_IMAGE_MAP_STATE_SYNC = 'board.image_map.state.sync',
}

export function useBoardSync() {
    const socket = useSocketStore().getSocket();
    const boardImageStore = useBoardImageStore();
    const { zoneMetaTable, boardImageMap, usedImageIds } = storeToRefs(boardImageStore);
    const { setBoardImageMap, placeBoardImage, removeBoardImage, resetBoardImageMap, findZoneIdByImageId } = boardImageStore;

    const { banPickSteps, isCurrentStepZone, advanceStep, resetStep } = useBanPickStep();

    const teamInfoStore = useTeamInfoStore();
    const { currentTeams } = storeToRefs(teamInfoStore);

    onMounted(() => {
        socket.on(`${SocketEvent.BOARD_IMAGE_MAP_STATE_SYNC}`, handleBoradImageMapSync);
        socket.on(`${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`, handleBoardImageDropBroadcast);
        socket.on(`${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`, handleBoardImageRestoreBroadcast);
        socket.on(`${SocketEvent.BOARD_IMAGE_MAP_RESET_BROADCAST}`, handleBoardImageResetBroadcast);
    });

    onUnmounted(() => {
        socket.off(`${SocketEvent.BOARD_IMAGE_MAP_STATE_SYNC}`);
        socket.off(`${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`);
        socket.off(`${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`);
        socket.off(`${SocketEvent.BOARD_IMAGE_MAP_RESET_BROADCAST}`);
    });

    function handleBoardImageDrop({ imgId, zoneId }: { imgId: string; zoneId: number }) {
        console.log(`useBoardSync handleImageDropped current image map imgId ${JSON.stringify(imgId)} zoneId ${zoneId}`);
        const previousZoneId = findZoneIdByImageId(imgId);
        const displacedZoneImageId = boardImageMap.value[zoneId];

        if (previousZoneId && displacedZoneImageId && previousZoneId !== zoneId) {
            console.log(`swap`);
            swapImages(imgId, displacedZoneImageId, zoneId, previousZoneId);
            socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId: previousZoneId });
            socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId });
            socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { imgId, zoneId });
            socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { imgId: displacedZoneImageId, zoneId: previousZoneId });
        } else {
            if (previousZoneId) {
                removeImage(previousZoneId);
                socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId: previousZoneId });
            } else if (displacedZoneImageId) {
                removeImage(zoneId);
                socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId });
            }
            placeImage(imgId, zoneId);

            socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { imgId, zoneId });

            if (isCurrentStepZone(zoneId)) {
                advanceStep();
            }
        }
    }

    function handleBoardImageRestore({ zoneId }: { zoneId: number }) {
        console.log(`useBoardSync handleImageRestore zoneId ${zoneId}`);
        removeImage(zoneId);
        socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId });
        console.log('[Client] Sent board.image.restore.request:', zoneId);
    }

    function handleBoardImageReset() {
        resetBoardImageMap();
        clearTacticalBoardIfNeeded();

        socket.emit(`${SocketEvent.BOARD_IMAGE_MAP_RESET_REQUEST}`);
        console.log('[Client] Sent board.images.reset.request:');
        resetStep();
    }

    function handleBanPickRecord() {
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

    function handleBoradImageMapSync(imageMap: Record<number, string>) {
        console.log(`handleBoradImageMapSync start`);
        setBoardImageMap(imageMap);
        for (const [key, value] of Object.entries(boardImageMap.value)) {
            const zoneId = Number(key)
            cloneToTacticalPoolIfNeeded(value, zoneId);
        }
    }

    function handleBoardImageDropBroadcast({ imageId, zoneId }: { imageId: string; zoneId: number }) {
        console.log(`[Client] image dropped received from other user imageId ${imageId} zoneId ${zoneId}`);
        placeImage(imageId, zoneId);
    }

    function handleBoardImageRestoreBroadcast({ zoneId }: { zoneId: number }) {
        console.log(`[Client] image restored received from other user zoneKey ${zoneId}`);
        removeImage(zoneId);
    }

    function handleBoardImageResetBroadcast() {
        console.log(`[Client] image reset received from other user`);

        resetBoardImageMap();
        clearTacticalBoardIfNeeded();
    }

    function swapImages(imgId: string, displacedImgId: string, zoneId: number, previousZoneId: number) {
        console.log(
            '[Swap]',
            JSON.stringify({
                imgId,
                displacedImgId,
                zoneId,
                previousZoneId,
            }),
        );
        removeImage(previousZoneId);
        removeImage(zoneId);
        placeImage(imgId, zoneId);
        placeImage(displacedImgId, previousZoneId);
    }

    function placeImage(imageId: string, zoneId: number) {
        placeBoardImage(imageId, zoneId);
        cloneToTacticalPoolIfNeeded(imageId, zoneId);
    }

    function removeImage(zoneId: number) {
        const imgId = boardImageMap.value[zoneId]
        removeBoardImage(zoneId);
        removeFromTacticalBoardIfNeeded(imgId, zoneId);   
    }

    // --- Tactical Board ---

    function getTeamIdFromZoneId(zoneId: number) {
        const match = banPickSteps.value.find((f) => f.zoneId === zoneId);
        return match?.teamId;
    }

    function cloneToTacticalPoolIfNeeded(imgId: string, zoneId: number) {
        const zone = zoneMetaTable.value[zoneId]
        switch (zone.type) {
            case ZoneType.UTILITY:
                for (const team of currentTeams.value) {
                    useTacticalBoardSync(team.id).addToPool(imgId);
                }
                break;
            case ZoneType.BAN:
                break;
            case ZoneType.PICK:
                const teamId = getTeamIdFromZoneId(zoneId);
                if (teamId) useTacticalBoardSync(teamId).addToPool(imgId);
                break;
        }
    }

    function removeFromTacticalBoardIfNeeded(imgId: string, zoneId: number) {
        const zone = zoneMetaTable.value[zoneId]
        switch (zone.type) {
            case ZoneType.PICK:
                const teamId = getTeamIdFromZoneId(zoneId);
                if (teamId) {
                    useTacticalBoardSync(teamId).removeFromBoard(imgId);
                }
                break;
            default:
                console.log(`Test B-2`);
                for (const team of currentTeams.value) {
                    useTacticalBoardSync(team.id).removeFromBoard(imgId);
                }
                break;
        }
    }

    function clearTacticalBoardIfNeeded() {
        for (const team of currentTeams.value) {
            useTacticalBoardSync(team.id).clearBoard();
        }
    }

    return {
        boardImageMap: readonly(boardImageMap),
        usedImageIds,
        handleBoardImageDrop,
        handleBoardImageRestore,
        handleBoardImageReset,
        handleBanPickRecord,
    };
}
