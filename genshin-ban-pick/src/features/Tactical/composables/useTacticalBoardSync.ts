// src/features/TacticalBoard/useTacticalBoardSync.ts
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useSocketStore } from '@/stores/socketStore';
import { useTaticalBoardStore, type TacticalCellImageMap } from '@/stores/tacticalBoardStore';
import { useAuth } from '@/composables/useAuth';
import { useTeamInfoStore } from '@/stores/teamInfoStore';

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
    const { identityKey } = useAuth();
    const teamInfoStore = useTeamInfoStore();
    const { teamMembersMap } = storeToRefs(teamInfoStore);
    const taticalBoardStore = useTaticalBoardStore();
    const { placeCellImage, removeCellImage, reset, setTaticalCellImageMap } = taticalBoardStore;

    const userTeamId = computed(() => {
        for (const [teamId, members] of Object.entries(teamMembersMap.value)) {
            if (members.some((m) => m.type === 'online' && m.user.identityKey === identityKey.value)) {
                return Number(teamId);
            }
        }
        return null;
    });

    function handleTaticalCellImagePlace({ teamId, imgId, cellId }: { teamId: number; imgId: string; cellId: string }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image place broadcast`, { teamId, imgId, cellId });
        placeCellImage(teamId, cellId, imgId);
        if (userTeamId.value !== teamId) return;
        socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_PLACE_REQUEST}`, { teamId, imgId, cellId });
    }

    function handleTaticalCellImageRemove({ teamId, cellId }: { teamId: number; cellId: string }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image remove`, { teamId, cellId });
        removeCellImage(teamId, cellId);

        if (userTeamId.value !== teamId) return;
        socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_REQUEST}`, { teamId, cellId });
    }

    function handleTaticalCellImageMapReset({ teamId }: { teamId: number }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image remove reset`, { teamId });
        reset(teamId);

        if (userTeamId.value !== teamId) return;
        socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_RESET_REQUEST}`, { teamId });
    }

    function handleTaticalCellImagePlaceBroadcast({ teamId, imgId, cellId }: { teamId: number; imgId: string; cellId: string }) {
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image place broadcast`, { teamId, imgId, cellId });
        placeCellImage(teamId, cellId, imgId);
    }

    function handleTaticalCellImageRemoveBroadcast({ teamId, cellId }: { teamId: number; cellId: string }) {
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image remove broadcast`, { teamId, cellId });
        removeCellImage(teamId, cellId);
    }

    function handleTaticalCellImageMapResetBroadcast({ teamId }: { teamId: number }) {
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image remove reset broadcast`, { teamId });
        reset(teamId);
    }

    function handleTaticalCellImageMapStateSync({ teamId, taticalCellImageMap }: { teamId: number; taticalCellImageMap: TacticalCellImageMap }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image map state sync`, { teamId, taticalCellImageMap }, userTeamId.value);
        if (userTeamId.value !== teamId) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tatical cell image map state sync`, { teamId, taticalCellImageMap });
        setTaticalCellImageMap(teamId, taticalCellImageMap);
    }

    onMounted(() => {
        console.debug('[TATICAL BOARD SYNC] On mounted');
        socket.on(`${SocketEvent.TATICAL_CELL_IMAGE_PLACE_BROADCAST}`, handleTaticalCellImagePlaceBroadcast);
        socket.on(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_BROADCAST}`, handleTaticalCellImageRemoveBroadcast);
        socket.on(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_RESET_BROADCAST}`, handleTaticalCellImageMapResetBroadcast);
        socket.on(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_STATE_SYNC_SELF}`, handleTaticalCellImageMapStateSync);

        if (userTeamId.value !== null) {
            socket.emit(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_STATE_REQUEST}`, { teamId: userTeamId.value });
        }
    });

    onUnmounted(() => {
        console.debug('[TATICAL BOARD SYNC] On unmounted');
        socket.off(`${SocketEvent.TATICAL_CELL_IMAGE_PLACE_BROADCAST}`);
        socket.off(`${SocketEvent.TATICAL_CELL_IMAGE_REMOVE_BROADCAST}`);
        socket.off(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_RESET_BROADCAST}`);
        socket.off(`${SocketEvent.TATICAL_CELL_IMAGE_MAP_STATE_SYNC_SELF}`);
    });

    return {
        handleTaticalCellImagePlace,
        handleTaticalCellImageRemove,
        handleTaticalCellImageMapReset,
    };
}
