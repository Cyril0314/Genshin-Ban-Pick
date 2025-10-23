// src/Team/useTeamInfoSync.ts
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted } from 'vue'

import { useSocketStore } from '@/stores/socketStore'
import { useTeamInfoStore } from '@/stores/teamInfoStore'

import type { TeamMembersMap } from '@/types/ITeam'

enum SocketEvent {
  TEAM_MEMBERS_UPDATE_REQUEST = 'team.members.update.request',
  TEAM_MEMBERS_UPDATE_BROADCAST = 'team.members.update.broadcast',

  TEAM_MEMBERS_MAP_STATE_SYNC_SELF = 'team.members_map.state.sync.self',
}

export function useTeamInfoSync() {
  const socket = useSocketStore().getSocket()
  const teamInfoStore = useTeamInfoStore()
  const { teamInfoPair, teamMembersMap } = storeToRefs(teamInfoStore)

  function setTeamMembers(teamId: number, members: string) {
    console.debug(`[TEAM INFO SYNC] Sent team members update request`, teamId, members);
    teamInfoStore.setTeamMembers(teamId, members)

    socket.emit(`${SocketEvent.TEAM_MEMBERS_UPDATE_REQUEST}`, { teamId, members })
  }

  function handleTeamMembersMapStateSync(teamMembersMap: TeamMembersMap) {
    console.debug(`[TEAM INFO SYNC] Handle team members map state sync`, teamMembersMap);
    teamInfoStore.setTeamMembersMap(teamMembersMap)
  }

  function handleTeamMembersUpdateBroadcast({ teamId, members }: { teamId: number; members: string }) {
    console.debug(`[TEAM INFO SYNC] Handle team members update broadcast`, teamId, members);
    teamInfoStore.setTeamMembers(teamId, members)
  }

  onMounted(() => {
    console.debug('[TEAM INFO SYNC] On mounted')
    socket.on(`${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_SELF}`, handleTeamMembersMapStateSync)
    socket.on(`${SocketEvent.TEAM_MEMBERS_UPDATE_BROADCAST}`, handleTeamMembersUpdateBroadcast)
  })

  onUnmounted(() => {
    console.debug('[TEAM INFO SYNC] On unmounted')
    socket.off(`${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_SELF}`)
    socket.off(`${SocketEvent.TEAM_MEMBERS_UPDATE_BROADCAST}`)
  })

  return {
    teamInfoPair,
    teamMembersMap,
    setTeamMembers
  }
}
