// src/Team/useTeamInfoSync.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { useSocketStore } from '@/network/socket'

type TeamKey = 'aether' | 'lumine'
export interface TeamInfoModel {
  name: string
  members: string
}
const teamInfoMap = ref<Record<TeamKey, TeamInfoModel>>({
  aether: { name: 'Team Aether', members: '' },
  lumine: { name: 'Team Lumine', members: '' },
})

export function useTeamInfoSync() {
  const socket = useSocketStore().getSocket()

  function updateTeam(team: TeamKey, info: TeamInfoModel) {
    console.log(`updateTeam team ${team} info: ${JSON.stringify(info)}`)
    teamInfoMap.value[team] = info
    const members = info.members
    console.log(`updateTeam members ${members}`)
    socket.emit('team.members.update.request', {
      team,
      content: members,
      senderId: socket.id,
    })
  }

  function setTeamMembers(team: TeamKey, content: string) {
    teamInfoMap.value[team].members = content
  }

  function syncTeamMembersMapFromServer(state: Record<TeamKey, string>) {
    console.log(`syncTeamMembersMapFromServer state ${JSON.stringify(state)}`)
    for (const [team, content] of Object.entries(state)) {
        teamInfoMap.value[team as TeamKey].members = content
    }
  }

  function handleTeamMembersUpdateBroadcast({
    team,
    content,
    senderId,
  }: {
    team: TeamKey
    content: string
    senderId: string
  }) {
    if (socket.id === senderId) return
    console.log(`[Client] team members updated from other user team ${team} content ${content}`)
    teamInfoMap.value[team].members = content
  }

  onMounted(() => {
    socket.on('team.members.state.sync', syncTeamMembersMapFromServer)
    socket.on('team.members.update.broadcast', handleTeamMembersUpdateBroadcast)
  })

  onUnmounted(() => {
    socket.off('team.members.state.sync')
    socket.off('team.members.update.broadcast')
  })

  return {
    teamInfoMap: teamInfoMap,
    updateTeam,
    setTeamMembers,
  }
}
