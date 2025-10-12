// src/Team/useTeamInfoSync.ts
import { onMounted, onUnmounted } from 'vue'

import { useSocketStore } from '@/network/socket'
import { useTeamInfoStore } from '@/stores/teamInfoStore'

export function useTeamInfoSync() {
  const socket = useSocketStore().getSocket()
  const teamInfoStore = useTeamInfoStore()

  function setTeamMembers(teamId: number, members: string) {
    teamInfoStore.setTeamMembers(teamId, members)

    socket.emit('team.members.update.request', {
      teamId,
      members: members,
      senderId: socket.id,
    })
  }

  function syncTeamMembersMapFromServer(teamInfoMap: Record<number, string>) {
    teamInfoStore.setTeamInfoMap(teamInfoMap)
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
    console.log(`[Client] team members updated from other user teamId ${teamId} content ${members}`)
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
    teamInfoPair: teamInfoStore.teamInfoPair,
    teamInfoMap: teamInfoStore.teamInfoMap,
    setTeamMembers
  }
}
