// src/modules/tactical/sync/useTacticalBoardSync.ts
import { useSocketStore } from '@/app/stores/socketStore';
import { useTacticalBoardStore } from '../store/tacticalBoardStore';
import { TacticalEvent } from '@shared/contracts/tactical/value-types';
import { useMyTeamInfo } from '@/modules/shared/ui/composables/useMyTeamInfo';
import { useTacticalUseCase } from '../ui/composables/useTacticalUseCase';

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';


export function useTacticalBoardSync() {
    const socket = useSocketStore().getSocket();
    const tacticalBoardStore = useTacticalBoardStore();
    const { myTeamSlot } = useMyTeamInfo()
    const tacticalUseCase =
        useTacticalUseCase();

    function fetchCellImageMapState(teamSlot: number) {
        console.debug('[TATICAL BOARD SYNC] Sent cell image map state request');
        socket.emit(`${TacticalEvent.CellImageMapStateRequest}`, { teamSlot });
    }

    function registerTacticalBoardSync() {
        socket.on(TacticalEvent.CellImagePlaceBroadcast, handleTacticalCellImagePlaceBroadcast);
        socket.on(TacticalEvent.CellImageRemoveBroadcast, handleTacticalCellImageRemoveBroadcast);
        socket.on(TacticalEvent.CellImageMapResetBroadcast, handleTacticalCellImageMapResetBroadcast);
        socket.on(TacticalEvent.CellImageMapStateSyncSelf, handleTacticalCellImageMapStateSync);
    }

    function tacticalCellImagePlace({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image place`, { teamSlot, cellId, imgId });
        tacticalUseCase.handleTacticalCellImagePlace(teamSlot, cellId, imgId);

        if (myTeamSlot.value !== teamSlot) return;
        socket.emit(`${TacticalEvent.CellImagePlaceRequest}`, { teamSlot, cellId, imgId });
    }

    function tacticalCellImageRemove({ teamSlot, cellId }: { teamSlot: number; cellId: number }) {
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove`, { teamSlot, cellId });
        tacticalUseCase.handleTacticalCellImageRemove(teamSlot, cellId);

        if (myTeamSlot.value !== teamSlot) return;
        socket.emit(`${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId });
    }

    function handleTacticalCellImagePlaceBroadcast({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) {
        if (myTeamSlot.value !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image place broadcast`, { teamSlot, cellId, imgId });

        tacticalUseCase.handleTacticalCellImagePlace(teamSlot, cellId, imgId);
    }

    function handleTacticalCellImageRemoveBroadcast({ teamSlot, cellId }: { teamSlot: number; cellId: number }) {
        if (myTeamSlot.value !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove broadcast`, { teamSlot, cellId });
        tacticalUseCase.handleTacticalCellImageRemove(teamSlot, cellId);
    }

    function handleTacticalCellImageMapResetBroadcast({ teamSlot }: { teamSlot: number }) {
        if (myTeamSlot.value !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image remove reset broadcast`, { teamSlot });

        tacticalUseCase.handleTacticalCellImageMapReset(teamSlot);
    }

    function handleTacticalCellImageMapStateSync({
        teamSlot,
        tacticalCellImageMap,
    }: {
        teamSlot: number;
        tacticalCellImageMap: TacticalCellImageMap;
    }) {
        if (myTeamSlot.value !== teamSlot) return;
        console.debug(`[TATICAL BOARD SYNC] Handle tactical cell image map state sync`, { teamSlot, tacticalCellImageMap });
        tacticalUseCase.setTacticalCellImageMap(teamSlot, tacticalCellImageMap);
    }

    function tacticalCellImageMapReset(teamSlot: number) {
        console.debug('[TATICAL BOARD SYNC] Handle reset board', teamSlot);
        tacticalUseCase.handleTacticalCellImageMapReset(teamSlot);

        if (myTeamSlot.value !== teamSlot) return;
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
        registerTacticalBoardSync,
        fetchCellImageMapState,
        tacticalCellImagePlace,
        tacticalCellImageRemove,
        handleAllTeamResetBoard,
    };
}
