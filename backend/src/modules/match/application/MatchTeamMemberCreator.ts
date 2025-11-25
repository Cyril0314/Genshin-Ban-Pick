// backend/src/modules/match/application/MatchTeamMemberCreator.ts

import { Prisma } from '@prisma/client';
import { TeamMembersMap } from '../../../types/TeamMember.ts';
import { resolveIdentity } from '../domain/resolveIdentity.ts';

export class MatchTeamMemberCreator {
    static async createMatchTeamMembers(tx: Prisma.TransactionClient, teamMembersMap: TeamMembersMap, matchTeamIdMap: Record<number, number>) {
        const matchTeamMembers = [];
        for (const [teamSlotString, teamMembers] of Object.entries(teamMembersMap)) {
            const teamSlot = Number(teamSlotString);
            const matchTeamId = matchTeamIdMap[teamSlot];
            for (const [memberSlotString, member] of Object.entries(teamMembers)) {
                const memberSlot = Number(memberSlotString);
                const resolved = resolveIdentity(member);
                const matchTeamMember = await tx.matchTeamMember.create({
                    data: {
                        slot: memberSlot,
                        name: resolved.name,
                        teamId: matchTeamId,
                        memberRef: resolved.memberRef,
                        guestRef: resolved.guestRef,
                    },
                });

                matchTeamMembers.push(matchTeamMember)
            }
        }
        return matchTeamMembers
    }
}
