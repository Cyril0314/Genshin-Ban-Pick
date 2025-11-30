// backend/src/modules/team/domain/memberLeave.ts

import { removeTeamMember } from './removeTeamMember';

import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function memberLeave(teamMembersMap: TeamMembersMap, teamSlot: number, memberSlot: number ) {
    let nextTeamMembersMap = { ...teamMembersMap };
    let nextTeamMemberMap = removeTeamMember(nextTeamMembersMap[Number(teamSlot)], Number(memberSlot));
    nextTeamMembersMap = {
        ...nextTeamMembersMap,
        [teamSlot]: nextTeamMemberMap,
    };
    return nextTeamMembersMap
}
