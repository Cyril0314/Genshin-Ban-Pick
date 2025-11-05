// src/stores/teamInfoStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';

import type { ITeam } from '@/types/ITeam';
import type { TeamMember, TeamMembersMap } from '@/types/TeamMember';

export const useTeamInfoStore = defineStore('teamInfo', () => {
    const teams = shallowRef<ITeam[]>([]);
    const teamMembersMap = ref<TeamMembersMap>({});
    const teamInfoPair = computed(() => {
        const map = teamMembersMap.value;
        if (teams.value.length < 2) return null;
        const [firstTeam, secondTeam] = teams.value;
        return {
            left: { ...firstTeam, members: map[firstTeam.id] ?? [] },
            right: { ...secondTeam, name: secondTeam.name, members: map[secondTeam.id] ?? [] },
        };
    });

    watch(teamInfoPair, (teamInfoPair) => {
        console.debug('[TEAM INFO STORE] Watch team info pair', teamInfoPair)
    }, { deep: true, immediate: true })

    function initTeams(newTeams: ITeam[]) {
        console.debug('[TEAM INFO STORE] Init teams', newTeams);
        teams.value = newTeams;
    }

    function addTeamMember(teamId: number, member: TeamMember) {
        console.debug('[TEAM INFO STORE] Add team member', teamId, member);
        teamMembersMap.value[teamId].push(member);
    }

    function removeTeamMember(teamId: number, member: TeamMember) {
        console.debug('[TEAM INFO STORE] Remove team member', teamId, member);
        const teamMembers = teamMembersMap.value[teamId];
        const index = teamMembers.findIndex((m) => {
            return (
                (m.type === 'MANUAL' && member.type === 'MANUAL' && m.name === member.name) ||
                (m.type === 'ONLINE' && member.type === 'ONLINE' && m.user.identityKey === member.user.identityKey)
            );
        });
        if (index !== -1) {
            teamMembersMap.value[teamId].splice(index, 1);
        }
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
