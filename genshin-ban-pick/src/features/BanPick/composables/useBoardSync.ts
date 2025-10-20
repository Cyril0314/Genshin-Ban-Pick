// src/features/BanPick/composables//useBoardSync.vue

import { readonly, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useBanPickStep } from './useBanPickStep';
import { useTacticalBoardSync } from '@/features/Tactical/composables/useTacticalBoardSync';
import { useSocketStore } from '@/network/socket';
import { useBoardImageStore } from '@/stores/boardImageStore';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { getZoneKey, ZoneType } from '@/types/IZone';

import type { ITeam } from '@/types/ITeam';
import type { IZone, IZoneImageEntry } from '@/types/IZone';

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
    const { boardImageMap, usedImageIds } = storeToRefs(boardImageStore);
    const { setBoardImageMap, placeBoardImage, removeBoardImage, resetBoardImageMap, findZoneImageEntryByImageId } = boardImageStore;

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

    function handleBoardImageDrop({ zoneImageEntry, zoneKey }: { zoneImageEntry: IZoneImageEntry; zoneKey: string }) {
        console.log(`useBoardSync handleImageDropped current image map zoneImageEntry ${JSON.stringify(zoneImageEntry)} zoneKey ${zoneKey}`);
        const previousZoneImageEntry = findZoneImageEntryByImageId(zoneImageEntry.imgId);
        console.log(`previousZoneImageEntry ${JSON.stringify(previousZoneImageEntry)}`);
        const displacedZoneImageEntry = boardImageMap.value[zoneKey];

        if (displacedZoneImageEntry && previousZoneImageEntry && getZoneKey(previousZoneImageEntry.zone) !== zoneKey) {
            console.log(`swap`);
            const previousZoneKey = getZoneKey(previousZoneImageEntry.zone);
            swapImages(zoneImageEntry, displacedZoneImageEntry, zoneImageEntry.zone, previousZoneImageEntry.zone);
            socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneKey: previousZoneKey });
            socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneKey });
            socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { zoneImageEntry, zoneKey });
            socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { zoneImageEntry: displacedZoneImageEntry, zoneKey: previousZoneKey });
        } else {
            if (previousZoneImageEntry) {
                const previousZoneKey = getZoneKey(previousZoneImageEntry.zone);
                console.log(`${JSON.stringify(zoneImageEntry)} remove from previousZone ${previousZoneKey}`);
                removeImage(previousZoneImageEntry.zone);
                socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneKey: previousZoneKey });
            } else if (displacedZoneImageEntry) {
                removeImage(zoneImageEntry.zone);
                socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneKey });
            }
            placeImage(zoneImageEntry, zoneImageEntry.zone);

            socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { zoneImageEntry, zoneKey });

            if (isCurrentStepZone(zoneImageEntry.zone)) {
                advanceStep();
            }
        }
    }

    function handleBoardImageRestore({ zoneKey }: { zoneKey: string }) {
        console.log(`useBoardSync handleImageRestore zoneKey ${zoneKey}`);
        const zoneImageEntry = boardImageMap.value[zoneKey]
        removeImage(zoneImageEntry.zone);
        socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneKey });
        console.log('[Client] Sent board.image.restore.request:', zoneKey);
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

    function handleBoradImageMapSync(imageMap: Record<string, IZoneImageEntry>) {
        console.log(`handleBoradImageMapSync start`);
        setBoardImageMap(imageMap);
        for (const [key, value] of Object.entries(boardImageMap.value)) {
            const zoneImageEntry = value as IZoneImageEntry;
            cloneToTacticalPoolIfNeeded(zoneImageEntry.imgId, zoneImageEntry.zone);
        }
    }

    function handleBoardImageDropBroadcast({ zoneImageEntry, zoneKey }: { zoneImageEntry: IZoneImageEntry; zoneKey: string }) {
        console.log(`[Client] image dropped received from other user zoneImageEntry ${zoneImageEntry} zoneKey ${zoneKey}`);
        placeImage(zoneImageEntry, zoneImageEntry.zone);
    }

    function handleBoardImageRestoreBroadcast({ zoneKey }: { zoneKey: string }) {
        console.log(`[Client] image restored received from other user zoneKey ${zoneKey}`);
        const zoneImageEntry = boardImageMap.value[zoneKey]
        removeImage(zoneImageEntry.zone);
    }

    function handleBoardImageResetBroadcast() {
        console.log(`[Client] image reset received from other user`);

        resetBoardImageMap();
        clearTacticalBoardIfNeeded();
    }

    function swapImages(zoneImageEntry: IZoneImageEntry, displacedZoneImageEntry: IZoneImageEntry, zone: IZone, previousZone: IZone) {
        console.log(
            '[Swap]',
            JSON.stringify({
                zoneImageEntry,
                displacedZoneImageEntry,
                zone,
                previousZone,
            }),
        );
        removeImage(previousZone);
        removeImage(zone);
        placeImage(zoneImageEntry, zone);
        placeImage(displacedZoneImageEntry, previousZone);
    }

    function placeImage(zoneImageEntry: IZoneImageEntry, zone: IZone) {
        const zoneKey = getZoneKey(zone)
        zoneImageEntry.zone = zone
        placeBoardImage(zoneImageEntry, zoneKey);
        cloneToTacticalPoolIfNeeded(zoneImageEntry.imgId, zoneImageEntry.zone);
    }

    function removeImage(zone: IZone) {
        const zoneKey = getZoneKey(zone)
        const zoneImageEntry = boardImageMap.value[zoneKey]
        removeBoardImage(zoneKey);
        removeFromTacticalBoardIfNeeded(zoneImageEntry.imgId, zoneImageEntry.zone);   
    }

    // --- Tactical Board ---

    function getTeamFromZone(zone: IZone): ITeam | undefined {
        const match = banPickSteps.value.find((f) => f.zone.id === zone.id && f.zone.zoneType === zone.zoneType && f.zone.zoneType === ZoneType.PICK);
        return match?.team;
    }

    function cloneToTacticalPoolIfNeeded(imgId: string, zone: IZone) {
        switch (zone.zoneType) {
            case ZoneType.UTILITY:
                for (const team of currentTeams.value) {
                    useTacticalBoardSync(team.id).addToPool(imgId);
                }
                break;
            case ZoneType.BAN:
                break;
            case ZoneType.PICK:
                const team = getTeamFromZone(zone);
                if (team) useTacticalBoardSync(team.id).addToPool(imgId);
                break;
        }
    }

    function removeFromTacticalBoardIfNeeded(imgId: string, zone: IZone) {
        switch (zone.zoneType) {
            case ZoneType.PICK:
                console.log(`Test B-1`);
                const team = getTeamFromZone(zone);
                if (team) {
                    console.log(`Test B-1-1 team ${JSON.stringify(team)}`);
                    useTacticalBoardSync(team.id).removeFromBoard(imgId);
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
