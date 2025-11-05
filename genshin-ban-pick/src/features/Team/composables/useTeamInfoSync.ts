// src/Team/useTeamInfoSync.ts
import { storeToRefs } from 'pinia';
import { onMounted, onUnmounted } from 'vue';

import { useSocketStore } from '@/stores/socketStore';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useRoomUserStore } from '@/stores/roomUserStore';

import type { IRoomUser } from '@/types/IRoomUser';
import type { TeamMember, TeamMembersMap } from '@/types/TeamMember';

enum SocketEvent {
    TEAM_MEMBER_ADD_REQUEST = 'team.member.add.request',
    TEAM_MEMBER_ADD_BROADCAST = 'team.member.add.broadcast',
    TEAM_MEMBER_REMOVE_REQUEST = 'team.member.remove.request',
    TEAM_MEMBER_REMOVE_BROADCAST = 'team.member.remove.broadcast',

    TEAM_MEMBERS_MAP_STATE_SYNC_SELF = 'team.members_map.state.sync.self',
    TEAM_MEMBERS_MAP_STATE_SYNC_ALL = 'team.members_map.state.sync.all',
}

export function useTeamInfoSync() {
    const socket = useSocketStore().getSocket();
    const teamInfoStore = useTeamInfoStore();
    const { teamMembersMap } = storeToRefs(teamInfoStore);
    const roomUserStore = useRoomUserStore();
    const { roomUsers } = storeToRefs(roomUserStore);

    function handleMemberInput({ name, teamId }: { name: string; teamId: number }) {
        const teamMembers = teamMembersMap.value[teamId];
        if (teamMembers.some((m) => m.type === 'MANUAL' && m.name === name)) {
            return;
        }
        let teamMember = createManualMember(name);
        addTeamMember(teamId, teamMember);
    }

    function handleMemberDrop({ identityKey, teamId }: { identityKey: string; teamId: number }) {
        const roomUser = roomUsers.value.find((roomUser) => roomUser.identityKey === identityKey);
        if (!roomUser) return;
        const teamMembers = teamMembersMap.value[teamId];
        if (teamMembers.some((m) => m.type === 'ONLINE' && m.user.identityKey === roomUser.identityKey)) {
            return;
        }
        let teamMember = createOnlineMember(roomUser);

        for (const [teamId, members] of Object.entries(teamMembersMap.value)) {
            teamMembersMap.value[Number(teamId)] = members.filter((m) => m.type !== 'ONLINE' || m.user.identityKey !== identityKey);
            removeTeamMember(Number(teamId), teamMember)
        }

        addTeamMember(teamId, teamMember);
    }

    function handleMemberRestore({ member, teamId }: { member: TeamMember; teamId: number }) {
        removeTeamMember(teamId, member);
    }

    function createOnlineMember(user: IRoomUser): TeamMember {
        return { type: 'ONLINE', user };
    }

    function createManualMember(name: string): TeamMember {
        return { type: 'MANUAL', name };
    }

    function addTeamMember(teamId: number, member: TeamMember) {
        console.debug('[TEAM INFO SYNC] Add team member', teamId, member);
        teamInfoStore.addTeamMember(teamId, member);

        socket.emit(`${SocketEvent.TEAM_MEMBER_ADD_REQUEST}`, { teamId, member });
    }

    function removeTeamMember(teamId: number, member: TeamMember) {
        console.debug('[TEAM INFO SYNC] Remove team member', teamId, member);
        teamInfoStore.removeTeamMember(teamId, member);

        socket.emit(`${SocketEvent.TEAM_MEMBER_REMOVE_REQUEST}`, { teamId, member });
    }

    function handleTeamMemberAddBroadcast({ teamId, member }: { teamId: number; member: TeamMember }) {
        console.debug(`[TEAM INFO SYNC] Handle team members add broadcast`, teamId, member);
        teamInfoStore.addTeamMember(teamId, member);
    }

    function handleTeamMemberRemoveBroadcast({ teamId, member }: { teamId: number; member: TeamMember }) {
        console.debug(`[TEAM INFO SYNC] Handle team members remove broadcast`, teamId, member);
        teamInfoStore.removeTeamMember(teamId, member);
    }

    function handleTeamMembersMapStateSync(teamMembersMap: TeamMembersMap) {
        console.debug(`[TEAM INFO SYNC] Handle team members map state sync`, teamMembersMap);
        teamInfoStore.setTeamMembersMap(teamMembersMap);
    }

    onMounted(() => {
        console.debug('[TEAM INFO SYNC] On mounted');
        socket.on(`${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_SELF}`, handleTeamMembersMapStateSync);
        socket.on(`${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_ALL}`, handleTeamMembersMapStateSync);
        socket.on(`${SocketEvent.TEAM_MEMBER_ADD_BROADCAST}`, handleTeamMemberAddBroadcast);
        socket.on(`${SocketEvent.TEAM_MEMBER_REMOVE_BROADCAST}`, handleTeamMemberRemoveBroadcast);
    });

    onUnmounted(() => {
        console.debug('[TEAM INFO SYNC] On unmounted');
        socket.off(`${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_SELF}`);
        socket.off(`${SocketEvent.TEAM_MEMBERS_MAP_STATE_SYNC_ALL}`);
        socket.off(`${SocketEvent.TEAM_MEMBER_ADD_BROADCAST}`);
        socket.off(`${SocketEvent.TEAM_MEMBER_REMOVE_BROADCAST}`);
    });

    return {
        handleMemberInput,
        handleMemberDrop,
        handleMemberRestore,
    };
}
