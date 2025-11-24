// src/modules/team/sync/useTeamInfoSync.ts

import { useSocketStore } from '@/app/stores/socketStore';
import { useRoomUserStore } from '@/modules/room';
import { teamUseCase } from '../application/teamUseCase';

import type { TeamMember, TeamMembersMap } from '../types/TeamMember';

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
    const roomUserStore = useRoomUserStore();

    const { handleMemberDrop, handleMemberInput, handleMemberRestore, addTeamMember, removeTeamMember, setTeamMembersMap } = teamUseCase();

    function registerTeamInfoSync() {
        socket.on(`${TeamEvent.MembersMapStateSyncSelf}`, handleTeamMembersMapStateSync);
        socket.on(`${TeamEvent.MembersMapStateSyncAll}`, handleTeamMembersMapStateSync);
        socket.on(`${TeamEvent.MemberAddBroadcast}`, handleTeamMemberAddBroadcast);
        socket.on(`${TeamEvent.MemberRemoveBroadcast}`, handleTeamMemberRemoveBroadcast);
    }

    function memberInput({ name, teamSlot, memberSlot }: { name: string; teamSlot: number; memberSlot: number }) {
        const teamMember = handleMemberInput(name, teamSlot, memberSlot);
        if (!teamMember) return;
        socket.emit(`${TeamEvent.MemberAddRequest}`, { teamSlot, memberSlot, member: teamMember });
    }

    function memberDrop({ identityKey, teamSlot, memberSlot }: { identityKey: string; teamSlot: number; memberSlot: number }) {
        const teamMember = handleMemberDrop(roomUserStore.roomUsers, identityKey, teamSlot, memberSlot);
        if (!teamMember) return;
        socket.emit(`${TeamEvent.MemberAddRequest}`, { teamSlot, memberSlot, member: teamMember });
    }

    function memberRestore({ teamSlot, memberSlot }: { teamSlot: number; memberSlot: number }) {
        handleMemberRestore(teamSlot, memberSlot);
        socket.emit(`${TeamEvent.MemberRemoveRequest}`, { teamSlot, memberSlot });
    }

    function handleTeamMemberAddBroadcast({ teamSlot, memberSlot, member }: { teamSlot: number; memberSlot: number; member: TeamMember }) {
        console.debug(`[TEAM INFO SYNC] Handle team members add broadcast`, teamSlot, member);
        addTeamMember(teamSlot, memberSlot, member);
    }

    function handleTeamMemberRemoveBroadcast({ teamSlot, memberSlot }: { teamSlot: number; memberSlot: number }) {
        console.debug(`[TEAM INFO SYNC] Handle team members remove broadcast`, teamSlot, memberSlot);
        removeTeamMember(teamSlot, memberSlot);
    }

    function handleTeamMembersMapStateSync(teamMembersMap: TeamMembersMap) {
        console.debug(`[TEAM INFO SYNC] Handle team members map state sync`, teamMembersMap);
        setTeamMembersMap(teamMembersMap);
    }

    return {
        registerTeamInfoSync,
        memberInput,
        memberDrop,
        memberRestore,
    };
}
