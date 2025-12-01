// src/modules/team/sync/useTeamInfoSync.ts

import { useSocketStore } from '@/app/stores/socketStore';
import { useRoomUserStore } from '@/modules/room';
import { TeamEvent } from '@shared/contracts/team/value-types';
import { useTeamUseCase } from '../ui/composables/useTeamUseCase';

import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function useTeamInfoSync() {
    const socket = useSocketStore().getSocket();
    const roomUserStore = useRoomUserStore();

    const teamUseCase = useTeamUseCase();

    function registerTeamInfoSync() {
        socket.on(`${TeamEvent.MembersMapStateSyncSelf}`, handleTeamMembersMapStateSync);
        socket.on(`${TeamEvent.MembersMapStateSyncAll}`, handleTeamMembersMapStateSync);
        socket.on(`${TeamEvent.MemberJoinBroadcast}`, handleTeamMemberJoinBroadcast);
        socket.on(`${TeamEvent.MemberLeaveBroadcast}`, handleTeamMemberLeaveBroadcast);
    }

    function fetchMembersMapState() {
        console.debug('[TEAM INFO SYNC] Sent members map state request');
        socket.emit(`${TeamEvent.MembersMapStateRequest}`);
    }

    function memberInput({ name, teamSlot, memberSlot }: { name: string; teamSlot: number; memberSlot: number }) {
        const teamMember = teamUseCase.handleMemberInput(name, teamSlot, memberSlot);
        if (!teamMember) return;
        socket.emit(`${TeamEvent.MemberJoinRequest}`, { teamSlot, memberSlot, teamMember });
    }

    function memberDrop({ identityKey, teamSlot, memberSlot }: { identityKey: string; teamSlot: number; memberSlot: number }) {
        const teamMember = teamUseCase.handleMemberDrop(roomUserStore.roomUsers, identityKey, teamSlot, memberSlot);
        if (!teamMember) return;
        socket.emit(`${TeamEvent.MemberJoinRequest}`, { teamSlot, memberSlot, teamMember });
    }

    function memberRestore({ teamSlot, memberSlot }: { teamSlot: number; memberSlot: number }) {
        teamUseCase.handleMemberLeave(teamSlot, memberSlot);
        socket.emit(`${TeamEvent.MemberLeaveRequest}`, { teamSlot, memberSlot });
    }

    function handleTeamMemberJoinBroadcast({ teamSlot, memberSlot, teamMember }: { teamSlot: number; memberSlot: number; teamMember: TeamMember }) {
        console.debug(`[TEAM INFO SYNC] Handle team members join broadcast`, teamSlot, teamMember);
        teamUseCase.handleMemberJoin(teamSlot, memberSlot, teamMember);
    }

    function handleTeamMemberLeaveBroadcast({ teamSlot, memberSlot }: { teamSlot: number; memberSlot: number }) {
        console.debug(`[TEAM INFO SYNC] Handle team members leave broadcast`, teamSlot, memberSlot);
        teamUseCase.handleMemberLeave(teamSlot, memberSlot);
    }

    function handleTeamMembersMapStateSync(teamMembersMap: TeamMembersMap) {
        console.debug(`[TEAM INFO SYNC] Handle team members map state sync`, teamMembersMap);
        teamUseCase.setTeamMembersMap(teamMembersMap);
    }

    return {
        registerTeamInfoSync,
        fetchMembersMapState,
        memberInput,
        memberDrop,
        memberRestore,
    };
}
