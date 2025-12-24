// src/modules/team/application/teamUseCase.ts

import { handleMemberInputDomain } from '../domain/handleMemberInputDomian';
import { handleMemberDropDomain } from '../domain/handleMemberDropDomain';
import { handleMemberLeaveDomain } from '../domain/handleMemberLeaveDomain';
import { handleMemberJoinDomain } from '../domain/handleMemberJoinDomain';

import type { IRoomUser } from '@shared/contracts/room/IRoomUser';
import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';
import type { ITeam } from '@shared/contracts/team/ITeam';
import type { useTeamInfoStore } from '../store/teamInfoStore';

export default class TeamUseCase {
    constructor(private teamInfoStore: ReturnType<typeof useTeamInfoStore>) {}

    initTeams(teams: ITeam[]) {
        this.teamInfoStore.initTeams(teams);
    }

    setTeamMembersMap(teamMembersMap: TeamMembersMap) {
        this.teamInfoStore.setTeamMembersMap(teamMembersMap);
    }

    handleMemberInput(name: string, teamSlot: number, memberSlot: number) {
        const prevMap = this.teamInfoStore.teamMembersMap;
        const teamMember = handleMemberInputDomain(prevMap, teamSlot, name);
        if (!teamMember) return undefined
        this.handleMemberJoin(teamSlot, memberSlot, teamMember)
        return teamMember
    }

    handleMemberDrop(roomUsers: IRoomUser[], identityKey: string, teamSlot: number, memberSlot: number) {
        const prevMap = this.teamInfoStore.teamMembersMap;
        const teamMember = handleMemberDropDomain(prevMap, roomUsers, identityKey, teamSlot);
        if (!teamMember) return undefined
        this.handleMemberJoin(teamSlot, memberSlot, teamMember)
        return teamMember
    }

    handleMemberLeave(teamSlot: number, memberSlot: number) {
        const prevMap = this.teamInfoStore.teamMembersMap;
        const nextMap = handleMemberLeaveDomain(prevMap, teamSlot, memberSlot);
        this.teamInfoStore.setTeamMembersMap(nextMap);
    }

    handleMemberJoin(teamSlot: number, memberSlot: number, teamMember: TeamMember) {
        const prevMap = this.teamInfoStore.teamMembersMap;
        const nextMap = handleMemberJoinDomain(prevMap, teamSlot, memberSlot, teamMember);
        this.teamInfoStore.setTeamMembersMap(nextMap);
    }
}