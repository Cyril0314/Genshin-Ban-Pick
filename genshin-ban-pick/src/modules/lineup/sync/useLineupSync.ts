// src/modules/lineup/sync/useLineupSync.ts
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useSocketStore } from '@/app/stores/socketStore';
import { createLogger } from '@/app/utils/logger';
import { LineupEvent } from '@shared/contracts/lineup/value-types';
import { useTeamInfoStore } from '@/modules/team';
import { useAuthStore } from '@/modules/auth';
import { findMyTeamSlot } from '@/modules/team/domain/findMyTeamSlotDomain';
import { useLineupUseCase } from '../ui/composables/useLineupUseCase';

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

const logger = createLogger('lineup.sync');


export function useLineupSync() {
    const socket = useSocketStore().getSocket();
    const { teamMembersMap } = storeToRefs(useTeamInfoStore());
    const { identity } = storeToRefs(useAuthStore());
    const myTeamSlot = computed(() =>
        identity.value ? findMyTeamSlot(teamMembersMap.value, identity.value) : undefined,
    );
    const lineupUseCase = useLineupUseCase();

    function registerLineupSync() {
        socket.on(LineupEvent.ImagePlaceBroadcast, handleLineupImagePlaceBroadcast);
        socket.on(LineupEvent.ImageRemoveBroadcast, handleLineupImageRemoveBroadcast);
        socket.on(LineupEvent.ImageMapResetBroadcast, handleLineupImageMapResetBroadcast);
        socket.on(LineupEvent.AllTeamImageMapResetBroadcast, handleAllTeamLineupImageMapResetBroadcast);
        socket.on(LineupEvent.ImageMapStateSyncSelf, handleLineupImageMapStateSync);
    }

    function fetchLineupImageMapState(teamSlot: number) {
        logger.debug('sent lineup image map state request');
        socket.emit(`${LineupEvent.ImageMapStateRequest}`, { teamSlot });
    }

    function lineupImagePlace({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) {
        logger.debug('image place', { teamSlot, cellId, imgId });
        lineupUseCase.handleLineupImagePlace(teamSlot, cellId, imgId);

        if (myTeamSlot.value !== teamSlot) return;
        socket.emit(`${LineupEvent.ImagePlaceRequest}`, { teamSlot, cellId, imgId });
    }

    function lineupImageRemove({ teamSlot, cellId }: { teamSlot: number; cellId: number }) {
        logger.debug('image remove', { teamSlot, cellId });
        lineupUseCase.handleLineupImageRemove(teamSlot, cellId);

        if (myTeamSlot.value !== teamSlot) return;
        socket.emit(`${LineupEvent.ImageRemoveRequest}`, { teamSlot, cellId });
    }

    function lineupImageMapReset(teamSlot: number) {
        logger.debug('image map reset', teamSlot);
        lineupUseCase.handleLineupImageMapReset(teamSlot);

        if (myTeamSlot.value !== teamSlot) return;
        socket.emit(`${LineupEvent.ImageMapResetRequest}`, { teamSlot });
    }

    function allTeamLineupImageMapReset() {
        logger.debug('all team image map reset');
        lineupUseCase.handleAllTeamLineupImageMapReset();
        socket.emit(`${LineupEvent.AllTeamImageMapResetRequest}`);
    }

    function handleLineupImagePlaceBroadcast({ teamSlot, cellId, imgId }: { teamSlot: number; cellId: number; imgId: string }) {
        if (myTeamSlot.value !== teamSlot) return;
        logger.debug('image place broadcast', { teamSlot, cellId, imgId });
        lineupUseCase.handleLineupImagePlace(teamSlot, cellId, imgId);
    }

    function handleLineupImageRemoveBroadcast({ teamSlot, cellId }: { teamSlot: number; cellId: number }) {
        if (myTeamSlot.value !== teamSlot) return;
        logger.debug('image remove broadcast', { teamSlot, cellId });
        lineupUseCase.handleLineupImageRemove(teamSlot, cellId);
    }

    function handleLineupImageMapResetBroadcast({ teamSlot }: { teamSlot: number }) {
        if (myTeamSlot.value !== teamSlot) return;
        logger.debug('image map reset broadcast', { teamSlot });
        lineupUseCase.handleLineupImageMapReset(teamSlot);
    }

    function handleAllTeamLineupImageMapResetBroadcast() {
        logger.debug('all team image map reset broadcast');
        lineupUseCase.handleAllTeamLineupImageMapReset();
    }

    function handleLineupImageMapStateSync({
        teamSlot,
        lineupImageMap,
    }: {
        teamSlot: number;
        lineupImageMap: LineupImageMap;
    }) {
        if (myTeamSlot.value !== teamSlot) return;
        logger.debug('image map state sync', { teamSlot, lineupImageMap });
        lineupUseCase.setLineupImageMap(teamSlot, lineupImageMap);
    }

    return {
        registerLineupSync,
        fetchLineupImageMapState,
        lineupImagePlace,
        lineupImageRemove,
        lineupImageMapReset,
        allTeamLineupImageMapReset,
        myTeamSlot,
    };
}
