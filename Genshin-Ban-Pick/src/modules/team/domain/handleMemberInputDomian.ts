// src/modules/team/domain/handleMemberInputDomian.ts

import { createManualMemberDomain } from './createManualMemberDomain';

import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function handleMemberInputDomain(
    teamMembersMap: TeamMembersMap,
    teamSlot: number,
    name: string,
): TeamMember | null {
    const teamMembers = Object.values(teamMembersMap[teamSlot]);
    if (teamMembers.some((m) => m.type === 'Manual' && m.name === name)) {
        return null;
    }
    let teamMember = createManualMemberDomain(name);
    return teamMember
}
