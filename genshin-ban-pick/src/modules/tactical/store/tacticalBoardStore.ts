// src/modules/tactical/store/tacticalBoardStore.ts

import { computed, reactive, ref, shallowRef, watch } from "vue";
import { defineStore } from "pinia";

import type { ITeam } from "@/modules/team";
import type { TacticalCellImageMap } from "../types/TacticalCellImageMap";

export const useTacticalBoardStore = defineStore('tacticalBoard', () => {
    const teamTacticalCellImageMap = ref<Record<number, TacticalCellImageMap>>({});
    const numberOfTeamSetup = shallowRef(0)
    const numberOfSetupCharacter = shallowRef(0)

    watch(teamTacticalCellImageMap, (teamTacticalBoardPanelMap) => {
        console.debug('[TATICAL BOARD STORE] Watch team tactical board panel map', teamTacticalBoardPanelMap)
    }, { immediate: true })


    function initTeamTacticalCellImageMap(teams: ITeam[], newNumberOfTeamSetup: number, newNumberOfSetupCharacter: number) {
        console.debug('[TATICAL BOARD STORE] Init team tactical board panel map', teams)
        for (const team of teams) {
            teamTacticalCellImageMap.value[team.slot] = {};
        }
        numberOfTeamSetup.value = newNumberOfTeamSetup
        numberOfSetupCharacter.value = newNumberOfSetupCharacter
    }

    function setTacticalCellImageMap(teamSlot: number, newTacticalCellImageMap: TacticalCellImageMap) {
        console.debug('[TATICAL BOARD STORE] Set tactical cell image map', teamSlot, newTacticalCellImageMap)
        teamTacticalCellImageMap.value[teamSlot] = newTacticalCellImageMap
    }

    return {
        teamTacticalCellImageMap,
        numberOfTeamSetup,
        numberOfSetupCharacter,
        initTeamTacticalCellImageMap,
        setTacticalCellImageMap,
    }
})