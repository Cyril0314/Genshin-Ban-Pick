// src/features/TacticalBoard/useTacticalBoardSync.ts
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useSocketStore } from '@/stores/socketStore';
import { useTacticalBoardStore, type TacticalCellImageMap } from '@/stores/tacticalBoardStore';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useAuthStore } from '@/stores/authStore';

enum SocketEvent {
    TATICAL_CELL_IMAGE_PLACE_REQUEST = 'tactical.cell.image.place.request',
    TATICAL_CELL_IMAGE_PLACE_BROADCAST = 'tactical.cell.image.place.broadcast',

    TATICAL_CELL_IMAGE_REMOVE_REQUEST = 'tactical.cell.image.remove.request',
    TATICAL_CELL_IMAGE_REMOVE_BROADCAST = 'tactical.cell.image.remove.broadcast',

    TATICAL_CELL_IMAGE_MAP_RESET_REQUEST = 'tactical.cell.image_map.reset.request',
    TATICAL_CELL_IMAGE_MAP_RESET_BROADCAST = 'tactical.cell.image_map.reset.broadcast',

    TATICAL_CELL_IMAGE_MAP_STATE_REQUEST = 'tactical.cell.image_map.state.request',
    TATICAL_CELL_IMAGE_MAP_STATE_SYNC_SELF = 'tactical.cell.image_map.state.sync.self',
}

export function useTacticalBoardSync() {
    const socket = useSocketStore().getSocket();
    const authStore = useAuthStore();
    const { identityKey } = storeToRefs(authStore);
    const teamInfoStore = useTeamInfoStore();
    const { teamMembersMap } = storeToRefs(teamInfoStore);
    const tacticalBoardStore = useTacticalBoardStore();
    const { teamTacticalBoardPanelMap } = storeToRefs(tacticalBoardStore);
    const { addImageToPool, removeImageFromPool, placeCellImage, removeCellImage, resetBoard, setTacticalCellImageMap, findCellIdByImageId } = tacticalBoardStore;

    const userTeamId = computed(() => {
        for (const [teamId, members] of Object.entries(teamMembersMap.value)) {
            if (members.some((m) => m.type === 'ONLINE' && m.user.identityKey === identityKey.value)) {
                return Number(teamId);
            }
        }
        return null;
    });

    function registerTacticalBoardSync() {
        socket.on(SocketEvent.TATICAL_CELL_IMAGE_PLACE_BROADCAST, handleTacticalCellImagePlaceBroadcast);
        socket.on(SocketEvent.TATICAL_CELL_IMAGE_REMOVE_BROADCAST, handleTacticalCellImageRemoveBroadcast);
        socket.on(SocketEvent.TATICAL_CELL_IMAGE_MAP_RESET_BROADCAST, handleTacticalCellImageMapResetBroadcast);
        socket.on(SocketEvent.TATICAL_CELL_IMAGE_MAP_STATE_SYNC_SELF, handleTacticalCellImageMapStateSync);
    }

    function handleTacticalCellImagePlace({ teamId, cellId, imgId }: { teamId: number; cellId: number; imgId: string }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image place`, { teamId, cellId, imgId });
        const tacticalBoardPanel = teamTacticalBoardPanelMap.value[teamId];
        const previousCellId = findCellIdByImageId(teamId, imgId);
        const displacedCellImgId = tacticalBoardPanel.cellImageMap[cellId] ?? null;

        if (previousCellId !== null && displacedCellImgId !== null && previousCellId !== cellId) {
            swapImages(teamId, cellId, previousCellId, imgId, displacedCellImgId);
            if (userTeamId.value === teamId) {
                socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_REQUEST}`, { teamId, cellId: previousCellId });
                socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_REQUEST}`, { teamId, cellId });
                socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_PLACE_REQUEST}`, { teamId, cellId, imgId });
                socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_PLACE_REQUEST}`, { teamId, cellId: previousCellId, imgId: displacedCellImgId });
            }
        } else {
            if (previousCellId !== null) {
                removeCellImage(teamId, previousCellId);
                if (userTeamId.value === teamId) {
                    socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_REQUEST}`, { teamId, cellId: previousCellId });
                }
            } else if (displacedCellImgId !== null) {
                removeCellImage(teamId, cellId);
                if (userTeamId.value === teamId) {
                    socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_REQUEST}`, { teamId, cellId });
                }
            }
            placeCellImage(teamId, cellId, imgId);
            if (userTeamId.value === teamId) {
                socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_PLACE_REQUEST}`, { teamId, cellId, imgId });
            }
        }
    }

    function handleTacticalCellImageRemove({ teamId, cellId }: { teamId: number; cellId: number }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove`, { teamId, cellId });
        removeCellImage(teamId, cellId);

        if (userTeamId.value !== teamId) return;
        socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_REQUEST}`, { teamId, cellId });
    }

    function handleTacticalCellImagePlaceBroadcast({ teamId, cellId, imgId }: { teamId: number; cellId: number; imgId: string }) {
        console.debug(`userTeamId.value`, userTeamId.value)
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image place broadcast`, { teamId, cellId, imgId });
        placeCellImage(teamId, cellId, imgId);
    }

    function handleTacticalCellImageRemoveBroadcast({ teamId, cellId }: { teamId: number; cellId: number }) {
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove broadcast`, { teamId, cellId });
        removeCellImage(teamId, cellId);
    }

    function handleTacticalCellImageMapResetBroadcast({ teamId }: { teamId: number }) {
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove reset broadcast`, { teamId });
        resetBoard(teamId);
    }

    function handleTacticalCellImageMapStateSync({ teamId, tacticalCellImageMap }: { teamId: number; tacticalCellImageMap: TacticalCellImageMap }) {
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image map state sync`, { teamId, tacticalCellImageMap });
        setTacticalCellImageMap(teamId, tacticalCellImageMap);
    }

    function swapImages(teamId: number, cellId: number, previousCellId: number, imgId: string, displacedImgId: string) {
        removeCellImage(teamId, previousCellId);
        removeCellImage(teamId, cellId);
        placeCellImage(teamId, cellId, imgId);
        placeCellImage(teamId, previousCellId, displacedImgId);
    }

    function handleAddImageToPool(teamId: number, imgId: string) {
        console.debug('[TATICAL BOARD SYNC] Handle add image to pool', teamId, imgId)
        addImageToPool(teamId, imgId)
    }

    function handleRemoveImageFromBoard(teamId: number, imgId: string) {
        console.debug('[TATICAL BOARD SYNC] Handle remove image from board', teamId, imgId)
        removeImageFromPool(teamId, imgId)

        const cellId = findCellIdByImageId(teamId, imgId);
        if (cellId === null) return;
        removeCellImage(teamId, cellId)

        if (userTeamId.value !== teamId) return;
        socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_REQUEST}`, { teamId, cellId });
        
    }

    function handleResetBoard(teamId: number) {
        console.debug('[TATICAL BOARD SYNC] Handle reset board', teamId)
         resetBoard(teamId);

        if (userTeamId.value !== teamId) return;
        socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_RESET_REQUEST}`, { teamId });
    }

    function handleAllTeamAddImageToPool(imgId: string) {
        console.debug('[TATICAL BOARD SYNC] Handle all team add image to pool', imgId)
        for (const teamIdString of Object.keys(teamTacticalBoardPanelMap.value)) {
            const teamId = Number(teamIdString)
            handleAddImageToPool(teamId, imgId);
        }
    }

    function handleAllTeamRemoveImageFromBoard(imgId: string) {
        console.debug('[TATICAL BOARD SYNC] Handle all team remove image from board', imgId)
        for (const teamIdString of Object.keys(teamTacticalBoardPanelMap.value)) {
            const teamId = Number(teamIdString)
            handleRemoveImageFromBoard(teamId, imgId)
        }
    }

    function handleAllTeamResetBoard() {
        console.debug('[TATICAL BOARD STORE] Handle all team reset board')
        for (const teamIdString of Object.keys(teamTacticalBoardPanelMap.value)) {
            const teamId = Number(teamIdString)
            handleResetBoard(teamId)
        }
    }

    return {
        userTeamId,
        registerTacticalBoardSync,
        handleTacticalCellImagePlace,
        handleTacticalCellImageRemove,
        handleAddImageToPool,
        handleRemoveImageFromBoard,
        handleAllTeamAddImageToPool,
        handleAllTeamRemoveImageFromBoard,
        handleAllTeamResetBoard,
    };
}
