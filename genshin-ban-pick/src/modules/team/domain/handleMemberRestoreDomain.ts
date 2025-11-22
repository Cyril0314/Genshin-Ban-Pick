// src/modules/team/domain/handleMemberRestoreDomain.ts

import { removeTeamMemberDomain } from "./removeTeamMemberDomain";

import type { TeamMembersMap } from "../types/TeamMember";

export function handleMemberRestoreDomain(teamMembersMap: TeamMembersMap, teamSlot: number, memberSlot: number) {
    let nextMap = { ...teamMembersMap };
    let nextTeamMemberMap = removeTeamMemberDomain(nextMap[Number(teamSlot)], Number(memberSlot));
    return {
        ...nextMap,
        [teamSlot]: nextTeamMemberMap,
    }
}