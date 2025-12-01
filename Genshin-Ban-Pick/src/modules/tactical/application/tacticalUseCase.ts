// src/modules/tactical/application/tacticalUseCase.ts

import { handleTacticalCellImageMapResetDomain } from '../domain/handleTacticalCellImageMapResetDomain';
import { handleTacticalCellImagePlaceDomain } from '../domain/handleTacticalCellImagePlaceDomain';
import { handleTacticalCellImageRemoveDomain } from '../domain/handleTacticalCellImageRemoveDomain';
import { useTacticalBoardStore } from '../store/tacticalBoardStore';

import type { ITeam } from '@shared/contracts/team/ITeam';
import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function tacticalUseCase() {
    const tacticalBoardStore = useTacticalBoardStore();

    function initTeamTacticalCellImageMap(teams: ITeam[], newNumberOfTeamSetup: number, newNumberOfSetupCharacter: number) {
        tacticalBoardStore.initTeamTacticalCellImageMap(teams, newNumberOfTeamSetup, newNumberOfSetupCharacter);
    }

    function handleTacticalCellImagePlace(teamSlot: number, cellId: number, imgId: string) {
        const prevMap = tacticalBoardStore.teamTacticalCellImageMap[teamSlot];
        const nextMap = handleTacticalCellImagePlaceDomain(prevMap, cellId, imgId);
        tacticalBoardStore.setTacticalCellImageMap(teamSlot, nextMap);
    }

    function handleTacticalCellImageRemove(teamSlot: number, cellId: number) {
        const prevMap = tacticalBoardStore.teamTacticalCellImageMap[teamSlot];
        const nextMap = handleTacticalCellImageRemoveDomain(prevMap, cellId);
        tacticalBoardStore.setTacticalCellImageMap(teamSlot, nextMap);
    }

    function handleTacticalCellImageMapReset(teamSlot: number) {
        const prevMap = tacticalBoardStore.teamTacticalCellImageMap[teamSlot];
        const nextMap = handleTacticalCellImageMapResetDomain(prevMap);
        tacticalBoardStore.setTacticalCellImageMap(teamSlot, nextMap);
    }

    function setTacticalCellImageMap(teamSlot: number, newTacticalCellImageMap: TacticalCellImageMap) {
        tacticalBoardStore.setTacticalCellImageMap(teamSlot, newTacticalCellImageMap);
    }

    return {
        initTeamTacticalCellImageMap,
        handleTacticalCellImagePlace,
        handleTacticalCellImageRemove,
        handleTacticalCellImageMapReset,
        setTacticalCellImageMap,
    };
}
