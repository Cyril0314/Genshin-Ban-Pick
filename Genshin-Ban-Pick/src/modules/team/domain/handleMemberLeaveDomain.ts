// src/modules/team/domain/handleMemberLeaveDomain.ts

import { removeTeamMemberDomain } from "./removeTeamMemberDomain";

import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function handleMemberLeaveDomain(teamMembersMap: TeamMembersMap, teamSlot: number, memberSlot: number) {
    let nextTeamMembersMap = { ...teamMembersMap };
    let nextTeamMemberMap = removeTeamMemberDomain(nextTeamMembersMap[Number(teamSlot)], Number(memberSlot));
    nextTeamMembersMap = {
        ...nextTeamMembersMap,
        [teamSlot]: nextTeamMemberMap,
    };
    return nextTeamMembersMap
}