// src/modules/team/store/teamInfoStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';

import type { ITeam } from '../types/ITeam';
import type { TeamMember, TeamMembersMap } from '../types/TeamMember';

export const useTeamInfoStore = defineStore('teamInfo', () => {
    const teams = shallowRef<ITeam[]>([]);
    const teamMembersMap = ref<TeamMembersMap>({});
    const teamInfoPair = computed(() => {
        const map = teamMembersMap.value;
        if (teams.value.length < 2) return null;
        const [firstTeam, secondTeam] = teams.value;
        return {
            left: { ...firstTeam, members: map[firstTeam.slot] ?? {} },
            right: { ...secondTeam, members: map[secondTeam.slot] ?? {} },
        };
    });

    watch(teamInfoPair, (teamInfoPair) => {
        console.debug('[TEAM INFO STORE] Watch team info pair', teamInfoPair)
    }, { deep: true, immediate: true })

    function initTeams(newTeams: ITeam[]) {
        console.debug('[TEAM INFO STORE] Init teams', newTeams);
        teams.value = newTeams;
    }

    function addTeamMember(teamSlot: number, memberSlot: number, member: TeamMember) {
        console.debug('[TEAM INFO STORE] Add team member', teamSlot, memberSlot, member);
        teamMembersMap.value[teamSlot][memberSlot] = member
    }

    function removeTeamMember(teamSlot: number, memberSlot: number) {
        console.debug('[TEAM INFO STORE] Remove team member', teamSlot, memberSlot);
        delete teamMembersMap.value[teamSlot][memberSlot];
    }

    function setTeamMembersMap(newTeamMembersMap: TeamMembersMap) {
        console.debug(`[TEAM INFO STORE] Set team members map`, newTeamMembersMap);
        teamMembersMap.value = newTeamMembersMap;
    }

    function resetTeamMembersMap() {
        console.debug(`[TEAM INFO STORE] Reset team members map`);
        teamMembersMap.value = {};
    }

    return {
        teams,
        teamMembersMap,
        teamInfoPair,
        initTeams,
        addTeamMember,
        removeTeamMember,
        setTeamMembersMap,
        resetTeamMembersMap,
    };
});
