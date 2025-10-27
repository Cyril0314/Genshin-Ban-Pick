// src/stores/teamInfoStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';

import type { ITeam, TeamMember, TeamMembersMap } from '@/types/ITeam';

export const useTeamInfoStore = defineStore('teamInfo', () => {
    const teams = shallowRef<ITeam[]>([]);
    const teamMembersMap = ref<TeamMembersMap>({});

    function initTeams(newTeams: ITeam[]) {
        console.debug('[TEAM INFO STORE] Init teams', newTeams)
        teams.value = newTeams;
    }

    function addTeamMember(teamId: number, member: TeamMember) {
        console.debug('[TEAM INFO STORE] Add team member', teamId, member)
        teamMembersMap.value[teamId].push(member)
    }

    function removeTeamMember(teamId: number, member: TeamMember) {
        console.debug('[TEAM INFO STORE] Remove team member', teamId, member)
        const teamMembers = teamMembersMap.value[teamId]
        const index = teamMembers.findIndex((m) => {
            return (m.type === 'manual' && member.type === 'manual' && m.name === member.name) ||
                (m.type === 'online' && member.type === 'online' && m.user.identityKey === member.user.identityKey)
        });
        if (index !== -1) {
            teamMembersMap.value[teamId].splice(index, 1)
        }
    }

    function setTeamMembersMap(newTeamMembersMap: TeamMembersMap) {
        console.debug(`[TEAM INFO STORE] Set team members map`, newTeamMembersMap);
        teamMembersMap.value = newTeamMembersMap;
    }

    function resetTeamMembersMap() {
        console.debug(`[TEAM INFO STORE] Reset team members map`);
        teamMembersMap.value = {}
    }

    return {
        teams,
        teamMembersMap,
        initTeams,
        addTeamMember,
        removeTeamMember,
        setTeamMembersMap,
        resetTeamMembersMap
    };
});
