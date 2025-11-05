// src/features/TacticalBoard/useTacticalBoardSync.ts
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useSocketStore } from '@/stores/socketStore';
import { useTacticalBoardStore, type TacticalCellImageMap } from '@/stores/tacticalBoardStore';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useAuthStore } from '@/stores/authStore';

enum TacticalEvent {
    CellImagePlaceRequest = 'tactical.cell.image.place.request',
    CellImagePlaceBroadcast = 'tactical.cell.image.place.broadcast',

    CellImageRemoveRequest = 'tactical.cell.image.remove.request',
    CellImageRemoveBroadcast = 'tactical.cell.image.remove.broadcast',

    CellImageMapResetRequest = 'tactical.cell.image_map.reset.request',
    CellImageMapResetBroadcast = 'tactical.cell.image_map.reset.broadcast',

    CellImageMapStateRequest = 'tactical.cell.image_map.state.request',
    CellImageMapStateSyncSelf = 'tactical.cell.image_map.state.sync.self',
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

    const userTeamSlot = computed(() => {
        for (const [teamSlot, members] of Object.entries(teamMembersMap.value)) {
            if (members.some((m) => m.type === 'Online' && m.user.identityKey === identityKey.value)) {
                return Number(teamSlot);
            }
        }
        return null;
    });

    function registerTacticalBoardSync() {
        socket.on(TacticalEvent.CellImagePlaceBroadcast, handleTacticalCellImagePlaceBroadcast);
        socket.on(TacticalEvent.CellImageRemoveBroadcast, handleTacticalCellImageRemoveBroadcast);
        socket.on(TacticalEvent.CellImageMapResetBroadcast, handleTacticalCellImageMapResetBroadcast);
        socket.on(TacticalEvent.CellImageMapStateSyncSelf, handleTacticalCellImageMapStateSync);
    }

    function handleTacticalCellImagePlace({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image place`, { teamSlot, cellId, imgId });
        const tacticalBoardPanel = teamTacticalBoardPanelMap.value[teamSlot];
        const previousCellId = findCellIdByImageId(teamSlot, imgId);
        const displacedCellImgId = tacticalBoardPanel.cellImageMap[cellId] ?? null;

        if (previousCellId !== null && displacedCellImgId !== null && previousCellId !== cellId) {
            swapImages(teamSlot, cellId, previousCellId, imgId, displacedCellImgId);
            if (userTeamSlot.value === teamSlot) {
                socket.emit(`${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId: previousCellId });
                socket.emit(`${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId });
                socket.emit(`${TacticalEvent.CellImagePlaceRequest}`, { teamSlot, cellId, imgId });
                socket.emit(`${TacticalEvent.CellImagePlaceRequest}`, { teamSlot, cellId: previousCellId, imgId: displacedCellImgId });
            }
        } else {
            if (previousCellId !== null) {
                removeCellImage(teamSlot, previousCellId);
                if (userTeamSlot.value === teamSlot) {
                    socket.emit(`${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId: previousCellId });
                }
            } else if (displacedCellImgId !== null) {
                removeCellImage(teamSlot, cellId);
                if (userTeamSlot.value === teamSlot) {
                    socket.emit(`${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId });
                }
            }
            placeCellImage(teamSlot, cellId, imgId);
            if (userTeamSlot.value === teamSlot) {
                socket.emit(`${TacticalEvent.CellImagePlaceRequest}`, { teamSlot, cellId, imgId });
            }
        }
    }

    function handleTacticalCellImageRemove({ teamSlot, cellId }: { teamSlot: number; cellId: number }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove`, { teamSlot, cellId });
        removeCellImage(teamSlot, cellId);

        if (userTeamSlot.value !== teamSlot) return;
        socket.emit(`${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId });
    }

    function handleTacticalCellImagePlaceBroadcast({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) {
        console.debug(`userTeamSlot.value`, userTeamSlot.value)
        if (userTeamSlot.value !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image place broadcast`, { teamSlot, cellId, imgId });
        placeCellImage(teamSlot, cellId, imgId);
    }

    function handleTacticalCellImageRemoveBroadcast({ teamSlot, cellId }: { teamSlot: number; cellId: number }) {
        if (userTeamSlot.value !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove broadcast`, { teamSlot, cellId });
        removeCellImage(teamSlot, cellId);
    }

    function handleTacticalCellImageMapResetBroadcast({ teamSlot }: { teamSlot: number }) {
        if (userTeamSlot.value !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove reset broadcast`, { teamSlot });
        resetBoard(teamSlot);
    }

    function handleTacticalCellImageMapStateSync({ teamSlot, tacticalCellImageMap }: { teamSlot: number; tacticalCellImageMap: TacticalCellImageMap }) {
        if (userTeamSlot.value !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image map state sync`, { teamSlot, tacticalCellImageMap });
        setTacticalCellImageMap(teamSlot, tacticalCellImageMap);
    }

    function swapImages(teamSlot: number, cellId: number, previousCellId: number, imgId: string, displacedImgId: string) {
        removeCellImage(teamSlot, previousCellId);
        removeCellImage(teamSlot, cellId);
        placeCellImage(teamSlot, cellId, imgId);
        placeCellImage(teamSlot, previousCellId, displacedImgId);
    }

    function handleAddImageToPool(teamSlot: number, imgId: string) {
        console.debug('[TATICAL BOARD SYNC] Handle add image to pool', teamSlot, imgId)
        addImageToPool(teamSlot, imgId)
    }

    function handleRemoveImageFromBoard(teamSlot: number, imgId: string) {
        console.debug('[TATICAL BOARD SYNC] Handle remove image from board', teamSlot, imgId)
        removeImageFromPool(teamSlot, imgId)

        const cellId = findCellIdByImageId(teamSlot, imgId);
        if (cellId === null) return;
        removeCellImage(teamSlot, cellId)

        if (userTeamSlot.value !== teamSlot) return;
        socket.emit(`${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId });
        
    }

    function handleResetBoard(teamSlot: number) {
        console.debug('[TATICAL BOARD SYNC] Handle reset board', teamSlot)
         resetBoard(teamSlot);

        if (userTeamSlot.value !== teamSlot) return;
        socket.emit(`${TacticalEvent.CellImageMapResetRequest}`, { teamSlot });
    }

    function handleAllTeamAddImageToPool(imgId: string) {
        console.debug('[TATICAL BOARD SYNC] Handle all team add image to pool', imgId)
        for (const teamSlotString of Object.keys(teamTacticalBoardPanelMap.value)) {
            const teamSlot = Number(teamSlotString)
            handleAddImageToPool(teamSlot, imgId);
        }
    }

    function handleAllTeamRemoveImageFromBoard(imgId: string) {
        console.debug('[TATICAL BOARD SYNC] Handle all team remove image from board', imgId)
        for (const teamSlotString of Object.keys(teamTacticalBoardPanelMap.value)) {
            const teamSlot = Number(teamSlotString)
            handleRemoveImageFromBoard(teamSlot, imgId)
        }
    }

    function handleAllTeamResetBoard() {
        console.debug('[TATICAL BOARD STORE] Handle all team reset board')
        for (const teamSlotString of Object.keys(teamTacticalBoardPanelMap.value)) {
            const teamSlot = Number(teamSlotString)
            handleResetBoard(teamSlot)
        }
    }

    return {
        userTeamSlot,
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
