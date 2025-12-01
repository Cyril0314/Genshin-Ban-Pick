// src/modules/tactical/application/TacticalUseCase.ts

import { handleTacticalCellImageMapResetDomain } from '../domain/handleTacticalCellImageMapResetDomain';
import { handleTacticalCellImagePlaceDomain } from '../domain/handleTacticalCellImagePlaceDomain';
import { handleTacticalCellImageRemoveDomain } from '../domain/handleTacticalCellImageRemoveDomain';
import { useTacticalBoardStore } from '../store/tacticalBoardStore';

import type { ITeam } from '@shared/contracts/team/ITeam';
import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export default class TacticalUseCase {
    constructor(private tacticalBoardStore: ReturnType<typeof useTacticalBoardStore>) {}

    initTeamTacticalCellImageMap(teams: ITeam[], newNumberOfTeamSetup: number, newNumberOfSetupCharacter: number) {
        this.tacticalBoardStore.initTeamTacticalCellImageMap(teams, newNumberOfTeamSetup, newNumberOfSetupCharacter);
    }

    handleTacticalCellImagePlace(teamSlot: number, cellId: number, imgId: string) {
        const prevMap = this.tacticalBoardStore.teamTacticalCellImageMap[teamSlot];
        const nextMap = handleTacticalCellImagePlaceDomain(prevMap, cellId, imgId);
        this.tacticalBoardStore.setTacticalCellImageMap(teamSlot, nextMap);
    }

    handleTacticalCellImageRemove(teamSlot: number, cellId: number) {
        const prevMap = this.tacticalBoardStore.teamTacticalCellImageMap[teamSlot];
        const nextMap = handleTacticalCellImageRemoveDomain(prevMap, cellId);
        this.tacticalBoardStore.setTacticalCellImageMap(teamSlot, nextMap);
    }

    handleTacticalCellImageMapReset(teamSlot: number) {
        const prevMap = this.tacticalBoardStore.teamTacticalCellImageMap[teamSlot];
        const nextMap = handleTacticalCellImageMapResetDomain(prevMap);
        this.tacticalBoardStore.setTacticalCellImageMap(teamSlot, nextMap);
    }

    setTacticalCellImageMap(teamSlot: number, newTacticalCellImageMap: TacticalCellImageMap) {
        this.tacticalBoardStore.setTacticalCellImageMap(teamSlot, newTacticalCellImageMap);
    }
}
