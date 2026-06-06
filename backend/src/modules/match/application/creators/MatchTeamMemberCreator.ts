// backend/src/modules/match/application/creators/MatchTeamMemberCreator.ts

import { Prisma } from '@prisma/client';

import { getTeamMemberName } from '@shared/contracts/team/TeamMember';

import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export default class MatchTeamMemberCreator {
    static async createMatchTeamMembers(tx: Prisma.TransactionClient, teamMembersMap: TeamMembersMap, matchTeamIdMap: Record<number, number>) {
        const matchTeamMembers = [];
        for (const [teamSlotString, teamMembers] of Object.entries(teamMembersMap)) {
            const teamSlot = Number(teamSlotString);
            const matchTeamId = matchTeamIdMap[teamSlot];
            for (const [memberSlotString, member] of Object.entries(teamMembers)) {
                const memberSlot = Number(memberSlotString);
                const matchTeamMember = await tx.matchTeamMember.create({
                    data: {
                        slot: memberSlot,
                        name: getTeamMemberName(member),
                        teamId: matchTeamId,
                        memberRef: member.type === 'Member' ? member.id : null,
                        guestRef: member.type === 'Guest' ? member.id : null,
                    },
                });
                matchTeamMembers.push(matchTeamMember);
            }
        }
        return matchTeamMembers;
    }
}
