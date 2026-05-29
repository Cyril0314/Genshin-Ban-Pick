// backend/src/modules/team/domain/memberJoin.ts

import { removeTeamMember } from './removeTeamMember';
import { addTeamMember } from './addTeamMember';

import { isSameIdentity } from '@shared/contracts/identity/Identity';

import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function memberJoin(teamMembersMap: TeamMembersMap, teamSlot: number, memberSlot: number, teamMember: TeamMember) {
    let nextTeamMembersMap = { ...teamMembersMap };

    for (const [teamSlot, teamMembers] of Object.entries(nextTeamMembersMap)) {
        for (const [memberSlot, _teamMember] of Object.entries(teamMembers)) {
            if (_teamMember.type !== 'Name' && teamMember.type !== 'Name' && isSameIdentity(_teamMember, teamMember)) {
                let nextTeamMemberMap = removeTeamMember(nextTeamMembersMap[Number(teamSlot)], Number(memberSlot));
                nextTeamMembersMap = {
                    ...nextTeamMembersMap,
                    [teamSlot]: nextTeamMemberMap,
                };
            }
        }
    }

    const nextTeamMemberMap = addTeamMember(nextTeamMembersMap[teamSlot], memberSlot, teamMember);
    nextTeamMembersMap = {
        ...nextTeamMembersMap,
        [teamSlot]: nextTeamMemberMap,
    };

    return nextTeamMembersMap;
}
