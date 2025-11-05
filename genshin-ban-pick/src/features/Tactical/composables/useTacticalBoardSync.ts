// src/features/TacticalBoard/useTacticalBoardSync.ts
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useSocketStore } from '@/stores/socketStore';
import { useTaticalBoardStore, type TacticalCellImageMap } from '@/stores/tacticalBoardStore';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useAuthStore } from '@/stores/authStore';

enum SocketEvent {
    TATICAL_CELL_IMAGE_PLACE_REQUEST = 'tatical.cell.image.place.request',
    TATICAL_CELL_IMAGE_PLACE_BROADCAST = 'tatical.cell.image.place.broadcast',

    TATICAL_CELL_IMAGE_REMOVE_REQUEST = 'tatical.cell.image.remove.request',
    TATICAL_CELL_IMAGE_REMOVE_BROADCAST = 'tatical.cell.image.remove.broadcast',

    TATICAL_CELL_IMAGE_MAP_RESET_REQUEST = 'tatical.cell.image_map.reset.request',
    TATICAL_CELL_IMAGE_MAP_RESET_BROADCAST = 'tatical.cell.image_map.reset.broadcast',

    TATICAL_CELL_IMAGE_MAP_STATE_REQUEST = 'tatical.cell.image_map.state.request',
    TATICAL_CELL_IMAGE_MAP_STATE_SYNC_SELF = 'tatical.cell.image_map.state.sync.self',
}

export function useTacticalBoardSync() {
    const socket = useSocketStore().getSocket();
    const authStore = useAuthStore();
    const { identityKey } = storeToRefs(authStore);
    const teamInfoStore = useTeamInfoStore();
    const { teamMembersMap } = storeToRefs(teamInfoStore);
    const taticalBoardStore = useTaticalBoardStore();
    const { teamTaticalBoardPanelMap } = storeToRefs(taticalBoardStore);
    const { addImageToPool, removeImageFromPool, placeCellImage, removeCellImage, resetBoard, setTaticalCellImageMap, findCellIdByImageId } = taticalBoardStore;

    const userTeamId = computed(() => {
        for (const [teamId, members] of Object.entries(teamMembersMap.value)) {
            if (members.some((m) => m.type === 'ONLINE' && m.user.identityKey === identityKey.value)) {
                return Number(teamId);
            }
        }
        return null;
    });

    function registerTacticalBoardSync() {
        socket.on(SocketEvent.TATICAL_CELL_IMAGE_PLACE_BROADCAST, handleTaticalCellImagePlaceBroadcast);
        socket.on(SocketEvent.TATICAL_CELL_IMAGE_REMOVE_BROADCAST, handleTaticalCellImageRemoveBroadcast);
        socket.on(SocketEvent.TATICAL_CELL_IMAGE_MAP_RESET_BROADCAST, handleTaticalCellImageMapResetBroadcast);
        socket.on(SocketEvent.TATICAL_CELL_IMAGE_MAP_STATE_SYNC_SELF, handleTaticalCellImageMapStateSync);
    }

    function handleTaticalCellImagePlace({ teamId, cellId, imgId }: { teamId: number; cellId: number; imgId: string }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image place`, { teamId, cellId, imgId });
        const taticalBoardPanel = teamTaticalBoardPanelMap.value[teamId];
        const previousCellId = findCellIdByImageId(teamId, imgId);
        const displacedCellImgId = taticalBoardPanel.cellImageMap[cellId] ?? null;

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

    function handleTaticalCellImageRemove({ teamId, cellId }: { teamId: number; cellId: number }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image remove`, { teamId, cellId });
        removeCellImage(teamId, cellId);

        if (userTeamId.value !== teamId) return;
        socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_REQUEST}`, { teamId, cellId });
    }

    function handleTaticalCellImagePlaceBroadcast({ teamId, cellId, imgId }: { teamId: number; cellId: number; imgId: string }) {
        console.debug(`userTeamId.value`, userTeamId.value)
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image place broadcast`, { teamId, cellId, imgId });
        placeCellImage(teamId, cellId, imgId);
    }

    function handleTaticalCellImageRemoveBroadcast({ teamId, cellId }: { teamId: number; cellId: number }) {
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image remove broadcast`, { teamId, cellId });
        removeCellImage(teamId, cellId);
    }

    function handleTaticalCellImageMapResetBroadcast({ teamId }: { teamId: number }) {
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image remove reset broadcast`, { teamId });
        resetBoard(teamId);
    }

    function handleTaticalCellImageMapStateSync({ teamId, taticalCellImageMap }: { teamId: number; taticalCellImageMap: TacticalCellImageMap }) {
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image map state sync`, { teamId, taticalCellImageMap });
        setTaticalCellImageMap(teamId, taticalCellImageMap);
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
        for (const teamIdString of Object.keys(teamTaticalBoardPanelMap.value)) {
            const teamId = Number(teamIdString)
            handleAddImageToPool(teamId, imgId);
        }
    }

    function handleAllTeamRemoveImageFromBoard(imgId: string) {
        console.debug('[TATICAL BOARD SYNC] Handle all team remove image from board', imgId)
        for (const teamIdString of Object.keys(teamTaticalBoardPanelMap.value)) {
            const teamId = Number(teamIdString)
            handleRemoveImageFromBoard(teamId, imgId)
        }
    }

    function handleAllTeamResetBoard() {
        console.debug('[TATICAL BOARD STORE] Handle all team reset board')
        for (const teamIdString of Object.keys(teamTaticalBoardPanelMap.value)) {
            const teamId = Number(teamIdString)
            handleResetBoard(teamId)
        }
    }

    return {
        userTeamId,
        registerTacticalBoardSync,
        handleTaticalCellImagePlace,
        handleTaticalCellImageRemove,
        handleAddImageToPool,
        handleRemoveImageFromBoard,
        handleAllTeamAddImageToPool,
        handleAllTeamRemoveImageFromBoard,
        handleAllTeamResetBoard,
    };
}
