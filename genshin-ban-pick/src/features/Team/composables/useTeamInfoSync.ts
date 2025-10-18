// src/Team/useTeamInfoSync.ts
import { onMounted, onUnmounted } from 'vue'

import { useSocketStore } from '@/network/socket'
import { useTeamInfoStore } from '@/stores/teamInfoStore'

import type { TeamMembersMap } from '@/types/ITeam'

export function useTeamInfoSync() {
  const socket = useSocketStore().getSocket()
  const teamInfoStore = useTeamInfoStore()
  const { teamInfoPair, teamMembersMap } = teamInfoStore

  console.log('[Sync] store instance id', teamInfoStore.$id)

  function setTeamMembers(teamId: number, members: string) {
    console.log(`setTeamMembers: teamId ${teamId} members ${members}`)
    teamInfoStore.setTeamMembers(teamId, members)

    socket.emit('team.members.update.request', {
      teamId,
      members: members,
      senderId: socket.id,
    })
  }

  function syncTeamMembersMapFromServer(teamMembersMap: TeamMembersMap) {
    console.log(`${JSON.stringify(teamMembersMap)}`)
    teamInfoStore.setTeamMembersMap(teamMembersMap)
  }

  function handleTeamMembersUpdateBroadcast({
    teamId,
    members,
    senderId,
  }: {
    teamId: number
    members: string
    senderId: string
  }) {
    if (socket.id === senderId) return
    console.log(`[Client] team members updated from other user teamId ${teamId} members ${members}`)
    teamInfoStore.setTeamMembers(teamId, members)
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
    teamInfoPair,
    teamMembersMap,
    setTeamMembers
  }
}
