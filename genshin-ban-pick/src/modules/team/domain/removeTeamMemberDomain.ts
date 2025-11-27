// src/modules/team/domain/removeTeamMemberDomain.ts

import type { TeamMember } from '@shared/contracts/team/TeamMember';

export function removeTeamMemberDomain(teamMemberMap: Record<string,TeamMember>, memberSlot: number) {
    const newMap = { ...teamMemberMap };
    delete newMap[memberSlot];
    return newMap;
}