// src/modules/tactical/sync/useTacticalBoardSync.ts
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useSocketStore } from '@/app/stores/socketStore';
import { createLogger } from '@/app/utils/logger';
import { TacticalEvent } from '@shared/contracts/tactical/value-types';
import { useTeamInfoStore } from '@/modules/team';
import { useAuthStore } from '@/modules/auth';
import { findMyTeamSlot } from '@/modules/team/domain/findMyTeamSlotDomain';
import { useTacticalUseCase } from '../ui/composables/useTacticalUseCase';

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

const logger = createLogger('tactical.sync');


export function useTacticalBoardSync() {
    const socket = useSocketStore().getSocket();
    const { teamMembersMap } = storeToRefs(useTeamInfoStore());
    const { identity } = storeToRefs(useAuthStore());
    const myTeamSlot = computed(() =>
        identity.value ? findMyTeamSlot(teamMembersMap.value, identity.value) : undefined,
    );
    const tacticalUseCase = useTacticalUseCase();

    function registerTacticalBoardSync() {
        socket.on(TacticalEvent.CellImagePlaceBroadcast, handleTacticalCellImagePlaceBroadcast);
        socket.on(TacticalEvent.CellImageRemoveBroadcast, handleTacticalCellImageRemoveBroadcast);
        socket.on(TacticalEvent.CellImageMapResetBroadcast, handleTacticalCellImageMapResetBroadcast);
        socket.on(TacticalEvent.AllTeamCellImageMapResetBroadcast, handleTacticalCellAllTeamImageMapResetBroadcast);
        socket.on(TacticalEvent.CellImageMapStateSyncSelf, handleTacticalCellImageMapStateSync);
    }

    function fetchCellImageMapState(teamSlot: number) {
        logger.debug('sent cell image map state request');
        socket.emit(`${TacticalEvent.CellImageMapStateRequest}`, { teamSlot });
    }

    function tacticalCellImagePlace({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) {
        logger.debug('cell image place', { teamSlot, cellId, imgId });
        tacticalUseCase.handleTacticalCellImagePlace(teamSlot, cellId, imgId);

        if (myTeamSlot.value !== teamSlot) return;
        socket.emit(`${TacticalEvent.CellImagePlaceRequest}`, { teamSlot, cellId, imgId });
    }

    function tacticalCellImageRemove({ teamSlot, cellId }: { teamSlot: number; cellId: number }) {
        logger.debug('cell image remove', { teamSlot, cellId });
        tacticalUseCase.handleTacticalCellImageRemove(teamSlot, cellId);

        if (myTeamSlot.value !== teamSlot) return;
        socket.emit(`${TacticalEvent.CellImageRemoveRequest}`, { teamSlot, cellId });
    }

    function tacticalCellImageMapReset(teamSlot: number) {
        logger.debug('cell image map reset', teamSlot);
        tacticalUseCase.handleTacticalCellImageMapReset(teamSlot);

        if (myTeamSlot.value !== teamSlot) return;
        socket.emit(`${TacticalEvent.CellImageMapResetRequest}`, { teamSlot });
    }

    function allTeamTacticalCellImageMapReset() {
        logger.debug('all team cell image map reset');
        tacticalUseCase.handleAllTeamTacticalCellImageMapReset();
        socket.emit(`${TacticalEvent.AllTeamCellImageMapResetRequest}`);
    }

    function handleTacticalCellImagePlaceBroadcast({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) {
        if (myTeamSlot.value !== teamSlot) return;
        logger.debug('cell image place broadcast', { teamSlot, cellId, imgId });
        tacticalUseCase.handleTacticalCellImagePlace(teamSlot, cellId, imgId);
    }

    function handleTacticalCellImageRemoveBroadcast({ teamSlot, cellId }: { teamSlot: number; cellId: number }) {
        if (myTeamSlot.value !== teamSlot) return;
        logger.debug('cell image remove broadcast', { teamSlot, cellId });
        tacticalUseCase.handleTacticalCellImageRemove(teamSlot, cellId);
    }

    function handleTacticalCellImageMapResetBroadcast({ teamSlot }: { teamSlot: number }) {
        if (myTeamSlot.value !== teamSlot) return;
        logger.debug('cell image map reset broadcast', { teamSlot });
        tacticalUseCase.handleTacticalCellImageMapReset(teamSlot);
    }

    function handleTacticalCellAllTeamImageMapResetBroadcast() {
        logger.debug('all team cell image map reset broadcast');
        tacticalUseCase.handleAllTeamTacticalCellImageMapReset();
    }

    function handleTacticalCellImageMapStateSync({
        teamSlot,
        tacticalCellImageMap,
    }: {
        teamSlot: number;
        tacticalCellImageMap: TacticalCellImageMap;
    }) {
        if (myTeamSlot.value !== teamSlot) return;
        logger.debug('cell image map state sync', { teamSlot, tacticalCellImageMap });
        tacticalUseCase.setTacticalCellImageMap(teamSlot, tacticalCellImageMap);
    }

    return {
        registerTacticalBoardSync,
        fetchCellImageMapState,
        tacticalCellImagePlace,
        tacticalCellImageRemove,
        tacticalCellImageMapReset,
        allTeamTacticalCellImageMapReset,
        myTeamSlot,
    };
}
