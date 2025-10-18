// src/stores/teamInfoStore.ts

import { defineStore } from 'pinia';
import { ref, computed, toRaw, reactive, watch } from 'vue';

import type { ITeam, TeamMembersMap } from '@/types/ITeam';

export const useTeamInfoStore = defineStore('teamInfo', () => {
    const currentTeams = ref<ITeam[]>([]);
    const teamMembersMap = ref<TeamMembersMap>({});

    const teamInfoPair = computed(() => {
        console.log('[DEBUG] computed teamInfoPair re-evaluated');
        const teams = currentTeams.value;
        const map = teamMembersMap.value;
        if (Object.keys(map).length === 0 || teams.length < 2) return null;
        const [firstTeam, secondTeam] = teams;
        console.log('[DEBUG] firstTeam:', firstTeam, 'secondTeam:', secondTeam);
        console.log('[DEBUG] teamMembersMap.value:', map);
        return {
            left: { ...firstTeam, members: map[firstTeam.id] },
            right: { ...secondTeam, name: secondTeam.name, members: map[secondTeam.id] },
        };
    });

    watch(teamInfoPair, (pair) => {
        if (pair) {
            console.log('[INIT] teamInfoPair ready', pair)
            // ✅ 可在這裡做後續動作
        }
    }, { immediate: true })

    function initTeams(teams: ITeam[]) {
        console.log('[DEBUG] initTeams');
        if (Object.keys(teamMembersMap.value).length > 0) return;
        currentTeams.value = teams;
        console.log('[DEBUG] currentTeams');
        for (const team of teams) {
            teamMembersMap.value[team.id] = '';
        }
        console.log('[DEBUG] teamMembersMap');
        // watch(teamInfoPair, (val) => {
        //     console.log('[DEBUG] teamInfoPair changed', toRaw(val))
        //   }, { deep: true })
    }

    function setTeamMembers(teamId: number, members: string) {
        console.log(`[DEBUG] setTeamMembers teamId ${teamId} members ${members}`);
        // teamMembersMap.value[teamId] = members;
        teamMembersMap.value[teamId] = members;
        console.log('after setTeamMembers', toRaw(teamMembersMap));
    }

    function setTeamMembersMap(newTeamMembersMap: TeamMembersMap) {
        console.log('[DEBUG] setTeamMembersMap');
        for (const [id, members] of Object.entries(newTeamMembersMap)) {
            const teamId = Number(id);
            if (teamMembersMap.value[teamId]) {
                teamMembersMap.value[teamId] = members;
            }
        }
    }

    function reset() {
        teamMembersMap.value = {}
    }

    return { teamInfoPair, teamMembersMap, initTeams, setTeamMembers, setTeamMembersMap, reset };
});
