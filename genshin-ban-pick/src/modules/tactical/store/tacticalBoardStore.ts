// src/modules/tactical/store/tacticalBoardStore.ts

import { computed, reactive, ref, shallowRef, watch } from "vue";
import { defineStore } from "pinia";

import { createLogger } from '@/app/utils/logger';

const logger = createLogger('tactical.store');

import type { ITeam } from '@shared/contracts/team/ITeam';
import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export const useTacticalBoardStore = defineStore('tacticalBoard', () => {
    const teamTacticalCellImageMap = ref<Record<number, TacticalCellImageMap>>({});
    const numberOfTeamSetup = shallowRef(0)
    const numberOfSetupCharacter = shallowRef(0)

    watch(teamTacticalCellImageMap, (teamTacticalBoardPanelMap) => {
        logger.debug('watch team tactical cell image map', teamTacticalBoardPanelMap)
    }, { immediate: true })


    function initTeamTacticalCellImageMap(teams: ITeam[], newNumberOfTeamSetup: number, newNumberOfSetupCharacter: number) {
        logger.debug('init team tactical cell image map', teams)
        for (const team of teams) {
            teamTacticalCellImageMap.value[team.slot] = {};
        }
        numberOfTeamSetup.value = newNumberOfTeamSetup
        numberOfSetupCharacter.value = newNumberOfSetupCharacter
    }

    function setTacticalCellImageMap(teamSlot: number, newTacticalCellImageMap: TacticalCellImageMap) {
        logger.debug('set tactical cell image map', teamSlot, newTacticalCellImageMap)
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