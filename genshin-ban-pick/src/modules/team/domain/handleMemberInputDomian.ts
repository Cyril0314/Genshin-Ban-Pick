// src/modules/team/domain/removeTeamMemberDomain.ts

import { addTeamMemberDomain } from './addTeamMemberDomain';
import { createManualMemberDomain } from './createManualMemberDomain';

import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function handleMemberInputDomain(
    teamMembersMap: TeamMembersMap,
    teamSlot: number,
    name: string,
    memberSlot: number,
): { teamMembersMap: TeamMembersMap; teamMember?: TeamMember } {
    let nextMap = { ...teamMembersMap };
    const teamMembers = Object.values(teamMembersMap[teamSlot]);
    if (teamMembers.some((m) => m.type === 'Manual' && m.name === name)) {
        return { teamMembersMap: nextMap };
    }
    let teamMember = createManualMemberDomain(name);
    const nextTeamMemberMap = addTeamMemberDomain(nextMap[teamSlot], memberSlot, teamMember);

    return {
        teamMembersMap: {
            ...nextMap,
            [teamSlot]: nextTeamMemberMap,
        },
        teamMember,
    };
}
