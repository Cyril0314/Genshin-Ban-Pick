// backend/src/modules/team/domain/addTeamMember.ts

import type { TeamMember } from '@shared/contracts/team/TeamMember';

export function addTeamMember(teamMemberMap: Record<string, TeamMember>, memberSlot: number, member: TeamMember) {
    return {
        ...teamMemberMap,
        [memberSlot]: member,
    };
}
