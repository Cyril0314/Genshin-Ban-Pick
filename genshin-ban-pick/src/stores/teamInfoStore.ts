// src/stores/teamInfoStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';

import type { ITeam, TeamMembersMap } from '@/types/ITeam';

export const useTeamInfoStore = defineStore('teamInfo', () => {
    const teams = shallowRef<ITeam[]>([]);
    const teamMembersMap = ref<TeamMembersMap>({});
    const teamInfoPair = computed(() => {
        const map = teamMembersMap.value;
        if (teams.value.length < 2) return null;
        const [firstTeam, secondTeam] = teams.value;
        return {
            left: { ...firstTeam, members: map[firstTeam.id] ?? '' },
            right: { ...secondTeam, name: secondTeam.name, members: map[secondTeam.id] ?? '' },
        };
    });

    watch(teamInfoPair, (pair) => {
        console.debug('[TEAM INFO STORE] Watch team info pair', pair)
    }, { immediate: true })

    function initTeams(newTeams: ITeam[]) {
        console.debug('[TEAM INFO STORE] Init teams', newTeams)
        teams.value = newTeams;
    }

    function setTeamMembers(teamId: number, members: string) {
        console.debug(`[TEAM INFO STORE] Set team members`, teamId, members);
        teamMembersMap.value[teamId] = members;
    }

    function setTeamMembersMap(newTeamMembersMap: TeamMembersMap) {
        console.debug(`[TEAM INFO STORE] Set team members map`, newTeamMembersMap);
        teamMembersMap.value = newTeamMembersMap;
    }

    function resetTeamMembersMap() {
        console.debug(`[TEAM INFO STORE] Reset team members map`);
        teamMembersMap.value = {}
    }

    return { teams, teamInfoPair, teamMembersMap, initTeams, setTeamMembers, setTeamMembersMap, resetTeamMembersMap };
});
