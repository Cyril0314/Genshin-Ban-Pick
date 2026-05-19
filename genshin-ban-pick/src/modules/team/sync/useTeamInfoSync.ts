// src/modules/team/sync/useTeamInfoSync.ts

import { useSocketStore } from '@/app/stores/socketStore';
import { useRoomUserStore } from '@/modules/room';
import { createLogger } from '@/app/utils/logger';
import { TeamEvent } from '@shared/contracts/team/value-types';
import { useTeamUseCase } from '../ui/composables/useTeamUseCase';

import type { Identity } from '@shared/contracts/auth/Identity';
import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

const logger = createLogger('team.sync');

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
        logger.debug('sent members map state request');
        socket.emit(`${TeamEvent.MembersMapStateRequest}`);
    }

    function memberInput({ name, teamSlot, memberSlot }: { name: string; teamSlot: number; memberSlot: number }) {
        const teamMember = teamUseCase.handleMemberInput(name, teamSlot, memberSlot);
        if (!teamMember) return;
        socket.emit(`${TeamEvent.MemberJoinRequest}`, { teamSlot, memberSlot, teamMember });
    }

    function memberDrop({ identity, teamSlot, memberSlot }: { identity: Identity; teamSlot: number; memberSlot: number }) {
        const teamMember = teamUseCase.handleMemberDrop(roomUserStore.roomUsers, identity, teamSlot, memberSlot);
        if (!teamMember) return;
        socket.emit(`${TeamEvent.MemberJoinRequest}`, { teamSlot, memberSlot, teamMember });
    }

    function memberRestore({ teamSlot, memberSlot }: { teamSlot: number; memberSlot: number }) {
        teamUseCase.handleMemberLeave(teamSlot, memberSlot);
        socket.emit(`${TeamEvent.MemberLeaveRequest}`, { teamSlot, memberSlot });
    }

    function handleTeamMemberJoinBroadcast({ teamSlot, memberSlot, teamMember }: { teamSlot: number; memberSlot: number; teamMember: TeamMember }) {
        logger.debug('member join broadcast', teamSlot, teamMember);
        teamUseCase.handleMemberJoin(teamSlot, memberSlot, teamMember);
    }

    function handleTeamMemberLeaveBroadcast({ teamSlot, memberSlot }: { teamSlot: number; memberSlot: number }) {
        logger.debug('member leave broadcast', teamSlot, memberSlot);
        teamUseCase.handleMemberLeave(teamSlot, memberSlot);
    }

    function handleTeamMembersMapStateSync(teamMembersMap: TeamMembersMap) {
        logger.debug('members map state sync', teamMembersMap);
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
