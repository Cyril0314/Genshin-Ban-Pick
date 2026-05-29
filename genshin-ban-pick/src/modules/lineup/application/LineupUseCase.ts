// src/modules/lineup/application/LineupUseCase.ts

import { handleLineupImageMapResetDomain } from '../domain/handleLineupImageMapResetDomain';
import { handleLineupImagePlaceDomain } from '../domain/handleLineupImagePlaceDomain';
import { handleLineupImageRemoveDomain } from '../domain/handleLineupImageRemoveDomain';
import { useLineupStore } from '../store/lineupStore';

import type { ITeam } from '@shared/contracts/team/ITeam';
import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export default class LineupUseCase {
    constructor(private lineupStore: ReturnType<typeof useLineupStore>) {}

    initTeamLineupImageMap(teams: ITeam[], newNumberOfTeamSetup: number, newNumberOfSetupCharacter: number) {
        this.lineupStore.initTeamLineupImageMap(teams, newNumberOfTeamSetup, newNumberOfSetupCharacter);
    }

    handleLineupImagePlace(teamSlot: number, cellId: number, imgId: string) {
        const prevMap = this.lineupStore.teamLineupImageMap[teamSlot];
        const nextMap = handleLineupImagePlaceDomain(prevMap, cellId, imgId);
        this.lineupStore.setLineupImageMap(teamSlot, nextMap);
    }

    handleLineupImageRemove(teamSlot: number, cellId: number) {
        const prevMap = this.lineupStore.teamLineupImageMap[teamSlot];
        const nextMap = handleLineupImageRemoveDomain(prevMap, cellId);
        this.lineupStore.setLineupImageMap(teamSlot, nextMap);
    }

    handleLineupImageMapReset(teamSlot: number) {
        const prevMap = this.lineupStore.teamLineupImageMap[teamSlot];
        const nextMap = handleLineupImageMapResetDomain(prevMap);
        this.lineupStore.setLineupImageMap(teamSlot, nextMap);
    }

    handleAllTeamLineupImageMapReset() {
        for (const teamSlotString of Object.keys(this.lineupStore.teamLineupImageMap)) {
            const teamSlot = Number(teamSlotString);
            this.handleLineupImageMapReset(teamSlot);
        }
    }

    setLineupImageMap(teamSlot: number, newLineupImageMap: LineupImageMap) {
        this.lineupStore.setLineupImageMap(teamSlot, newLineupImageMap);
    }
}
