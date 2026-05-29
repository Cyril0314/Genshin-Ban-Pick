// src/modules/lineup/store/lineupStore.ts

import { ref, shallowRef, watch } from "vue";
import { defineStore } from "pinia";

import { createLogger } from '@/app/utils/logger';

const logger = createLogger('lineup.store');

import type { ITeam } from '@shared/contracts/team/ITeam';
import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export const useLineupStore = defineStore('lineup', () => {
    const teamLineupImageMap = ref<Record<number, LineupImageMap>>({});
    const numberOfTeamSetup = shallowRef(0)
    const numberOfSetupCharacter = shallowRef(0)

    watch(teamLineupImageMap, (next) => {
        logger.debug('watch team lineup image map', next)
    }, { immediate: true })


    function initTeamLineupImageMap(teams: ITeam[], newNumberOfTeamSetup: number, newNumberOfSetupCharacter: number) {
        logger.debug('init team lineup image map', teams)
        for (const team of teams) {
            teamLineupImageMap.value[team.slot] = {};
        }
        numberOfTeamSetup.value = newNumberOfTeamSetup
        numberOfSetupCharacter.value = newNumberOfSetupCharacter
    }

    function setLineupImageMap(teamSlot: number, newLineupImageMap: LineupImageMap) {
        logger.debug('set lineup image map', teamSlot, newLineupImageMap)
        teamLineupImageMap.value[teamSlot] = newLineupImageMap
    }

    return {
        teamLineupImageMap,
        numberOfTeamSetup,
        numberOfSetupCharacter,
        initTeamLineupImageMap,
        setLineupImageMap,
    }
})
