// src/Team/useTeamInfoSync.ts
import { storeToRefs } from 'pinia';

import { useSocketStore } from '@/stores/socketStore';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useRoomUserStore } from '@/stores/roomUserStore';

import type { IRoomUser } from '@/types/IRoomUser';
import type { TeamMember, TeamMembersMap } from '@/types/TeamMember';

enum TeamEvent {
    MemberAddRequest = 'team.member.add.request',
    MemberAddBroadcast = 'team.member.add.broadcast',
    MemberRemoveRequest = 'team.member.remove.request',
    MemberRemoveBroadcast = 'team.member.remove.broadcast',

    MembersMapStateSyncSelf = 'team.members_map.state.sync.self',
    MembersMapStateSyncAll = 'team.members_map.state.sync.all',
}

export function useTeamInfoSync() {
    const socket = useSocketStore().getSocket();
    const teamInfoStore = useTeamInfoStore();
    const { teamMembersMap } = storeToRefs(teamInfoStore);
    const roomUserStore = useRoomUserStore();
    const { roomUsers } = storeToRefs(roomUserStore);

    function registerTeamInfoSync() {
        socket.on(`${TeamEvent.MembersMapStateSyncSelf}`, handleTeamMembersMapStateSync);
        socket.on(`${TeamEvent.MembersMapStateSyncAll}`, handleTeamMembersMapStateSync);
        socket.on(`${TeamEvent.MemberAddBroadcast}`, handleTeamMemberAddBroadcast);
        socket.on(`${TeamEvent.MemberRemoveBroadcast}`, handleTeamMemberRemoveBroadcast);
    }

    function handleMemberInput({ name, teamSlot }: { name: string; teamSlot: number }) {
        const teamMembers = teamMembersMap.value[teamSlot];
        if (teamMembers.some((m) => m.type === 'Manual' && m.name === name)) {
            return;
        }
        let teamMember = createManualMember(name);
        addTeamMember(teamSlot, teamMember);
    }

    function handleMemberDrop({ identityKey, teamSlot }: { identityKey: string; teamSlot: number }) {
        const roomUser = roomUsers.value.find((roomUser) => roomUser.identityKey === identityKey);
        if (!roomUser) return;
        const teamMembers = teamMembersMap.value[teamSlot];
        if (teamMembers.some((m) => m.type === 'Online' && m.user.identityKey === roomUser.identityKey)) {
            return;
        }
        let teamMember = createOnlineMember(roomUser);

        for (const [teamSlot, members] of Object.entries(teamMembersMap.value)) {
            teamMembersMap.value[Number(teamSlot)] = members.filter((m) => m.type !== 'Online' || m.user.identityKey !== identityKey);
            removeTeamMember(Number(teamSlot), teamMember);
        }

        addTeamMember(teamSlot, teamMember);
    }

    function handleMemberRestore({ member, teamSlot }: { member: TeamMember; teamSlot: number }) {
        removeTeamMember(teamSlot, member);
    }

    function createOnlineMember(user: IRoomUser): TeamMember {
        return { type: 'Online', user };
    }

    function createManualMember(name: string): TeamMember {
        return { type: 'Manual', name };
    }

    function addTeamMember(teamSlot: number, member: TeamMember) {
        console.debug('[TEAM INFO SYNC] Add team member', teamSlot, member);
        teamInfoStore.addTeamMember(teamSlot, member);

        socket.emit(`${TeamEvent.MemberAddRequest}`, { teamSlot, member });
    }

    function removeTeamMember(teamSlot: number, member: TeamMember) {
        console.debug('[TEAM INFO SYNC] Remove team member', teamSlot, member);
        teamInfoStore.removeTeamMember(teamSlot, member);

        socket.emit(`${TeamEvent.MemberRemoveRequest}`, { teamSlot, member });
    }

    function handleTeamMemberAddBroadcast({ teamSlot, member }: { teamSlot: number; member: TeamMember }) {
        console.debug(`[TEAM INFO SYNC] Handle team members add broadcast`, teamSlot, member);
        teamInfoStore.addTeamMember(teamSlot, member);
    }

    function handleTeamMemberRemoveBroadcast({ teamSlot, member }: { teamSlot: number; member: TeamMember }) {
        console.debug(`[TEAM INFO SYNC] Handle team members remove broadcast`, teamSlot, member);
        teamInfoStore.removeTeamMember(teamSlot, member);
    }

    function handleTeamMembersMapStateSync(teamMembersMap: TeamMembersMap) {
        console.debug(`[TEAM INFO SYNC] Handle team members map state sync`, teamMembersMap);
        teamInfoStore.setTeamMembersMap(teamMembersMap);
    }

    return {
        registerTeamInfoSync,
        handleMemberInput,
        handleMemberDrop,
        handleMemberRestore,
    };
}
