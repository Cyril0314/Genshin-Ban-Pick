// backend/src/modules/team/domain/removeTeamMember.ts

import type { TeamMember } from '@shared/contracts/team/TeamMember';

export function removeTeamMember(teamMemberMap: Record<string, TeamMember>, memberSlot: number) {
    const newMap = { ...teamMemberMap };
    delete newMap[memberSlot];
    return newMap;
}