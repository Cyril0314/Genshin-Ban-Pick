// src/modules/team/application/teamUseCase.ts

import { handleMemberInputDomain } from '../domain/handleMemberInputDomian';
import { handleMemberDropDomain } from '../domain/handleMemberDropDomain';
import { handleMemberLeaveDomain } from '../domain/handleMemberLeaveDomain';
import { handleMemberJoinDomain } from '../domain/handleMemberJoinDomain';
import { useTeamInfoStore } from '../store/teamInfoStore';

import type { IRoomUser } from '@shared/contracts/room/IRoomUser';
import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';
import type { ITeam } from '@shared/contracts/team/ITeam';

export function teamUseCase() {
    const teamInfoStore = useTeamInfoStore();

    function initTeams(teams: ITeam[]) {
        teamInfoStore.initTeams(teams);
    }

    function setTeamMembersMap(teamMembersMap: TeamMembersMap) {
        teamInfoStore.setTeamMembersMap(teamMembersMap);
    }

    function handleMemberInput(name: string, teamSlot: number, memberSlot: number) {
        const prevMap = teamInfoStore.teamMembersMap;
        const teamMember = handleMemberInputDomain(prevMap, teamSlot, name);
        if (!teamMember) return null
        handleMemberJoin(teamSlot, memberSlot, teamMember)
        return teamMember
    }

    function handleMemberDrop(roomUsers: IRoomUser[], identityKey: string, teamSlot: number, memberSlot: number) {
        const prevMap = teamInfoStore.teamMembersMap;
        const teamMember = handleMemberDropDomain(prevMap, roomUsers, identityKey, teamSlot);
        if (!teamMember) return null
        handleMemberJoin(teamSlot, memberSlot, teamMember)
        return teamMember
    }

    function handleMemberLeave(teamSlot: number, memberSlot: number) {
        const prevMap = teamInfoStore.teamMembersMap;
        const nextMap = handleMemberLeaveDomain(prevMap, teamSlot, memberSlot);
        teamInfoStore.setTeamMembersMap(nextMap);
    }

    function handleMemberJoin(teamSlot: number, memberSlot: number, teamMember: TeamMember) {
        const prevMap = teamInfoStore.teamMembersMap;
        const nextMap = handleMemberJoinDomain(prevMap, teamSlot, memberSlot, teamMember);
        teamInfoStore.setTeamMembersMap(nextMap);
    }
    
    return {
        initTeams,
        setTeamMembersMap,
        handleMemberInput,
        handleMemberDrop,
        handleMemberJoin,
        handleMemberLeave,
    };
}
