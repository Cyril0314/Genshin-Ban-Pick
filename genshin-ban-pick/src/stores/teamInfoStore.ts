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
            left: { ...firstTeam, members: map[firstTeam.slot] ?? [] },
            right: { ...secondTeam, name: secondTeam.name, members: map[secondTeam.slot] ?? [] },
        };
    });

    watch(teamInfoPair, (teamInfoPair) => {
        console.debug('[TEAM INFO STORE] Watch team info pair', teamInfoPair)
    }, { deep: true, immediate: true })

    function initTeams(newTeams: ITeam[]) {
        console.debug('[TEAM INFO STORE] Init teams', newTeams);
        teams.value = newTeams;
    }

    function addTeamMember(teamSlot: number, member: TeamMember) {
        console.debug('[TEAM INFO STORE] Add team member', teamSlot, member);
        teamMembersMap.value[teamSlot].push(member);
    }

    function removeTeamMember(teamSlot: number, member: TeamMember) {
        console.debug('[TEAM INFO STORE] Remove team member', teamSlot, member);
        const teamMembers = teamMembersMap.value[teamSlot];
        const index = teamMembers.findIndex((m) => {
            return (
                (m.type === 'Manual' && member.type === 'Manual' && m.name === member.name) ||
                (m.type === 'Online' && member.type === 'Online' && m.user.identityKey === member.user.identityKey)
            );
        });
        if (index !== -1) {
            teamMembersMap.value[teamSlot].splice(index, 1);
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
