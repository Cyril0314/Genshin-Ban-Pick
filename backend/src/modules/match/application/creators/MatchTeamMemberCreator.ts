// backend/src/modules/match/application/creators/MatchTeamMemberCreator.ts

import { Prisma } from '@prisma/client';
import { resolveIdentity } from '../../domain/resolveIdentity';
import { DataNotFoundError } from '../../../../errors/AppError';
import { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export default class MatchTeamMemberCreator {
    static async createMatchTeamMembers(tx: Prisma.TransactionClient, teamMembersMap: TeamMembersMap, matchTeamIdMap: Record<number, number>) {
        const matchTeamMembers = [];
        for (const [teamSlotString, teamMembers] of Object.entries(teamMembersMap)) {
            const teamSlot = Number(teamSlotString);
            const matchTeamId = matchTeamIdMap[teamSlot];
            for (const [memberSlotString, member] of Object.entries(teamMembers)) {
                const memberSlot = Number(memberSlotString);
                const resolved = resolveIdentity(member);
                if (!resolved) throw new DataNotFoundError();
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
