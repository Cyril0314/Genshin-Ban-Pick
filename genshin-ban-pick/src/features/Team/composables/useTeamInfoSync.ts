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

    function handleMemberInput({ name, teamSlot, memberSlot }: { name: string; teamSlot: number; memberSlot: number }) {
        const teamMembers = Object.values(teamMembersMap.value[teamSlot]);
        if (teamMembers.some((m) => m.type === 'Manual' && m.name === name)) {
            return;
        }
        let teamMember = createManualMember(name);
        addTeamMember(teamSlot, memberSlot, teamMember);
    }

    function handleMemberDrop({ identityKey, teamSlot, memberSlot }: { identityKey: string; teamSlot: number; memberSlot: number }) {
        const roomUser = roomUsers.value.find((roomUser) => roomUser.identityKey === identityKey);
        if (!roomUser) return;
        const teamMembers = Object.values(teamMembersMap.value[teamSlot]);
        if (teamMembers.some((m) => m.type === 'Online' && m.user.identityKey === roomUser.identityKey)) {
            return;
        }
        let teamMember = createOnlineMember(roomUser);

        for (const [teamSlot, members] of Object.entries(teamMembersMap.value)) {
            for (const [memberSlot, member] of Object.entries(members)) {
                if (member.type === 'Online' && member.user.identityKey === identityKey) {
                    removeTeamMember(Number(teamSlot), Number(memberSlot));
                }
            }
        }

        addTeamMember(teamSlot, memberSlot, teamMember);
    }

    function handleMemberRestore({ teamSlot, memberSlot }: { teamSlot: number; memberSlot: number }) {
        removeTeamMember(teamSlot, memberSlot);
    }

    function createOnlineMember(user: IRoomUser): TeamMember {
        return { type: 'Online', user };
    }

    function createManualMember(name: string): TeamMember {
        return { type: 'Manual', name };
    }

    function addTeamMember(teamSlot: number, memberSlot: number, member: TeamMember) {
        console.debug('[TEAM INFO SYNC] Add team member', teamSlot, member, memberSlot);
        teamInfoStore.addTeamMember(teamSlot, memberSlot, member);

        socket.emit(`${TeamEvent.MemberAddRequest}`, { teamSlot, memberSlot, member });
    }

    function removeTeamMember(teamSlot: number, memberSlot: number) {
        console.debug('[TEAM INFO SYNC] Remove team member', teamSlot, memberSlot);
        teamInfoStore.removeTeamMember(teamSlot, memberSlot);

        socket.emit(`${TeamEvent.MemberRemoveRequest}`, { teamSlot, memberSlot });
    }

    function handleTeamMemberAddBroadcast({ teamSlot, memberSlot, member }: { teamSlot: number; memberSlot: number; member: TeamMember }) {
        console.debug(`[TEAM INFO SYNC] Handle team members add broadcast`, teamSlot, member);
        teamInfoStore.addTeamMember(teamSlot, memberSlot, member);
    }

    function handleTeamMemberRemoveBroadcast({ teamSlot, memberSlot }: { teamSlot: number; memberSlot: number }) {
        console.debug(`[TEAM INFO SYNC] Handle team members remove broadcast`, teamSlot, memberSlot);
        teamInfoStore.removeTeamMember(teamSlot, memberSlot);
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
