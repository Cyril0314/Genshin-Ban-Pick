// src/modules/team/domain/handleMemberJoinDomain.ts

import { addTeamMemberDomain } from './addTeamMemberDomain';
import { removeTeamMemberDomain } from './removeTeamMemberDomain';

import { isSameIdentity } from '@shared/contracts/identity/Identity';

import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function handleMemberJoinDomain(teamMembersMap: TeamMembersMap, teamSlot: number, memberSlot: number, teamMember: TeamMember ) {
    let nextTeamMembersMap = { ...teamMembersMap };

    for (const [teamSlot, teamMembers] of Object.entries(nextTeamMembersMap)) {
        for (const [memberSlot, _teamMember] of Object.entries(teamMembers)) {
            if (_teamMember.type !== 'Name' && teamMember.type !== 'Name' && isSameIdentity(_teamMember, teamMember)) {
                let nextTeamMemberMap = removeTeamMemberDomain(nextTeamMembersMap[Number(teamSlot)], Number(memberSlot));
                nextTeamMembersMap = {
                    ...nextTeamMembersMap,
                    [teamSlot]: nextTeamMemberMap,
                };
            }
        }
    }

    const nextTeamMemberMap = addTeamMemberDomain(nextTeamMembersMap[teamSlot], memberSlot, teamMember);
    nextTeamMembersMap = {
        ...nextTeamMembersMap,
        [teamSlot]: nextTeamMemberMap,
    };

    return nextTeamMembersMap;
}
