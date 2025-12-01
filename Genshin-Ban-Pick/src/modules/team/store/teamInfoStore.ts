// src/modules/team/store/teamInfoStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';

import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';
import type { ITeam } from '@shared/contracts/team/ITeam';

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

    watch(
        teamInfoPair,
        (teamInfoPair) => {
            console.debug('[TEAM INFO STORE] Watch team info pair', teamInfoPair);
        },
        { deep: true, immediate: true },
    );

    function initTeams(newTeams: ITeam[]) {
        console.debug('[TEAM INFO STORE] Init teams', newTeams);
        teams.value = newTeams;
    }

    function setTeamMembersMap(newTeamMembersMap: TeamMembersMap) {
        console.debug(`[TEAM INFO STORE] Set team members map`, newTeamMembersMap);
        teamMembersMap.value = newTeamMembersMap;
    }

    function setTeamMemberMap(teamSlot: number, newTeamMemberMap: Record<string, TeamMember>) {
        console.debug(`[TEAM INFO STORE] Set team member map`, newTeamMemberMap);
        teamMembersMap.value[teamSlot] = newTeamMemberMap;
    }

    return {
        teams,
        teamMembersMap,
        teamInfoPair,
        initTeams,
        setTeamMembersMap,
        setTeamMemberMap,
    };
});
