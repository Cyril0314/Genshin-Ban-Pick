// src/modules/team/domain/removeTeamMemberDomain.ts

import type { TeamMember } from "../types/TeamMember";

export function removeTeamMemberDomain(teamMemberMap: Record<string,TeamMember>, memberSlot: number) {
    const newMap = { ...teamMemberMap };
    delete newMap[memberSlot];
    return newMap;
}