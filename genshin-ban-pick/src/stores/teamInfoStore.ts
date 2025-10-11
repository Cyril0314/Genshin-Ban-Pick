// src/stores/teamInfoStore.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ITeam, ITeamInfo } from '@/types/ITeam'

export const useTeamInfoStore = defineStore('teamInfo', () => {
    const currentTeams = ref<ITeam[]>([])
    const teamInfoMap = ref<Record<number, ITeamInfo>>({})

    const teamInfoPair = computed(
        () => {
            console.log(`teams.length: ${currentTeams.value.length}`)
            if (currentTeams.value.length < 2) return
            let firstTeam = currentTeams.value[0]
            let secondTeam = currentTeams.value[1]
            return { left: teamInfoMap.value[firstTeam.id], right: teamInfoMap.value[secondTeam.id] }
        }
    )

    function initTeams(teams: ITeam[]) {
        if (Object.keys(teamInfoMap.value).length > 0) return
        currentTeams.value = teams
        teamInfoMap.value = Object.fromEntries(
            teams.map(team => [team.id, { id: team.id, name: team.name, members: '' }])
        )
    }

    function setTeamMembers(teamId: number, members: string) {
        teamInfoMap.value[teamId].members = members
    }

    function setTeamInfoMap(state: Record<number, string>) {
        for (const [id, members] of Object.entries(state)) {
            const teamId = Number(id)
            if (teamInfoMap.value[teamId]) {
                teamInfoMap.value[teamId].members = members
            }
        }
    }

    function reset() {
        teamInfoMap.value = {}
    }

    return { teamInfoPair, teamInfoMap, initTeams, setTeamMembers, setTeamInfoMap, reset }
})