// src/modules/team/domain/addTeamMemberDomain.ts

import type { TeamMember } from '@shared/contracts/team/TeamMember';

export function addTeamMemberDomain(teamMemberMap: Record<string, TeamMember>, memberSlot: number, member: TeamMember) {
    return {
        ...teamMemberMap,
        [memberSlot]: member,
    };
}
