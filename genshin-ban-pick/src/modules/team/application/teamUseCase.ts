// src/modules/team/application/teamUseCase.ts


import { addTeamMemberDomain } from '../domain/addTeamMemberDomain';
import { removeTeamMemberDomain } from '../domain/removeTeamMemberDomain';
import { handleMemberInputDomain } from '../domain/handleMemberInputDomian';
import { handleMemberDropDomain } from '../domain/handleMemberDropDomain';
import { handleMemberRestoreDomain } from '../domain/handleMemberRestoreDomain';
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

    function addTeamMember(teamSlot: number, memberSlot: number, member: TeamMember) {
        const prevMap = teamInfoStore.teamMembersMap[teamSlot];
        const nextMap = addTeamMemberDomain(prevMap, memberSlot, member);
        teamInfoStore.setTeamMemberMap(teamSlot, nextMap);
    }

    function removeTeamMember(teamSlot: number, memberSlot: number) {
        const prevMap = teamInfoStore.teamMembersMap[teamSlot];
        const nextMap = removeTeamMemberDomain(prevMap, memberSlot);
        teamInfoStore.setTeamMemberMap(teamSlot, nextMap);
    }

    function setTeamMembersMap(teamMembersMap: TeamMembersMap) {
        teamInfoStore.setTeamMembersMap(teamMembersMap);
    }

    function handleMemberInput(name: string, teamSlot: number, memberSlot: number) {
        const prevMap = teamInfoStore.teamMembersMap;
        const { teamMembersMap, teamMember } = handleMemberInputDomain(prevMap, teamSlot, name, memberSlot);
        teamInfoStore.setTeamMembersMap(teamMembersMap);
        return teamMember
    }

    function handleMemberDrop(roomUsers: IRoomUser[], identityKey: string, teamSlot: number, memberSlot: number) {
        const prevMap = teamInfoStore.teamMembersMap;
        const { teamMembersMap, teamMember } = handleMemberDropDomain(prevMap, roomUsers, identityKey, teamSlot, memberSlot);
        teamInfoStore.setTeamMembersMap(teamMembersMap);

        return teamMember
    }

    function handleMemberRestore(teamSlot: number, memberSlot: number) {
        const prevMap = teamInfoStore.teamMembersMap;
        const nextMap = handleMemberRestoreDomain(prevMap, teamSlot, memberSlot);
        teamInfoStore.setTeamMembersMap(nextMap);
    }
    
    return {
        initTeams,
        addTeamMember,
        removeTeamMember,
        setTeamMembersMap,
        handleMemberInput,
        handleMemberDrop,
        handleMemberRestore,
    };
}
