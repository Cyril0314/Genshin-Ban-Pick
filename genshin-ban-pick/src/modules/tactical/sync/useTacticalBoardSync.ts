// src/modules/tactical/sync/useTacticalBoardSync.ts
import { useSocketStore } from '@/app/stores/socketStore';
import { useTeamInfoStore } from '@/modules/team';
import { useAuthStore } from '@/modules/auth';
import { tacticalUseCase } from '../application/tacticalUseCase';
import { useTacticalBoardStore } from '../store/tacticalBoardStore';

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

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
    const teamInfoStore = useTeamInfoStore();
    const tacticalBoardStore = useTacticalBoardStore();
    const { handleTacticalCellImagePlace, handleTacticalCellImageRemove, handleTacticalCellImageMapReset, setTacticalCellImageMap } =
        tacticalUseCase();

    function getUserTeamSlot() {
        for (const [teamSlot, members] of Object.entries(teamInfoStore.teamMembersMap)) {
            if (Object.values(members).some((m) => m.type === 'Online' && m.user.identityKey === authStore.identityKey)) {
                return Number(teamSlot);
            }
        }
        return null;
    }

    function registerTacticalBoardSync() {
        socket.on(TacticalEvent.CellImagePlaceBroadcast, handleTacticalCellImagePlaceBroadcast);
        socket.on(TacticalEvent.CellImageRemoveBroadcast, handleTacticalCellImageRemoveBroadcast);
        socket.on(TacticalEvent.CellImageMapResetBroadcast, handleTacticalCellImageMapResetBroadcast);
        socket.on(TacticalEvent.CellImageMapStateSyncSelf, handleTacticalCellImageMapStateSync);
    }

    function tacticalCellImagePlace({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image place`, { teamSlot, cellId, imgId });
        handleTacticalCellImagePlace(teamSlot, cellId, imgId);

        if (getUserTeamSlot() !== teamSlot) return;
        socket.emit(`${TacticalEvent.CellImagePlaceRequest}`, { teamSlot, cellId, imgId });
    }

    function tacticalCellImageRemove({ teamSlot, cellId }: { teamSlot: number; cellId: number }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove`, { teamSlot, cellId });
        handleTacticalCellImageRemove(teamSlot, cellId);

        if (getUserTeamSlot() !== teamSlot) return;
        socket.emit(`${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId });
    }

    function handleTacticalCellImagePlaceBroadcast({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) {
        if (getUserTeamSlot() !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image place broadcast`, { teamSlot, cellId, imgId });

        handleTacticalCellImagePlace(teamSlot, cellId, imgId);
    }

    function handleTacticalCellImageRemoveBroadcast({ teamSlot, cellId }: { teamSlot: number; cellId: number }) {
        if (getUserTeamSlot() !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove broadcast`, { teamSlot, cellId });
        handleTacticalCellImageRemove(teamSlot, cellId);
    }

    function handleTacticalCellImageMapResetBroadcast({ teamSlot }: { teamSlot: number }) {
        if (getUserTeamSlot() !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove reset broadcast`, { teamSlot });

        handleTacticalCellImageMapReset(teamSlot);
    }

    function handleTacticalCellImageMapStateSync({
        teamSlot,
        tacticalCellImageMap,
    }: {
        teamSlot: number;
        tacticalCellImageMap: TacticalCellImageMap;
    }) {
        if (getUserTeamSlot() !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image map state sync`, { teamSlot, tacticalCellImageMap });
        setTacticalCellImageMap(teamSlot, tacticalCellImageMap);
    }

    function tacticalCellImageMapReset(teamSlot: number) {
        console.debug('[TATICAL BOARD SYNC] Handle reset board', teamSlot);
        handleTacticalCellImageMapReset(teamSlot);

        if (getUserTeamSlot() !== teamSlot) return;
        socket.emit(`${TacticalEvent.CellImageMapResetRequest}`, { teamSlot });
    }

    function handleAllTeamResetBoard() {
        console.debug('[TATICAL BOARD STORE] Handle all team reset board');
        for (const teamSlotString of Object.keys(tacticalBoardStore.teamTacticalCellImageMap)) {
            const teamSlot = Number(teamSlotString);
            tacticalCellImageMapReset(teamSlot);
        }
    }

    return {
        getUserTeamSlot,
        registerTacticalBoardSync,
        tacticalCellImagePlace,
        tacticalCellImageRemove,
        handleAllTeamResetBoard,
    };
}
