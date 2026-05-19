// backend/src/modules/match/domain/resolveIdentity.ts

import type { ResolvedIdentity } from "../types/ResolvedIdentity";
import type { TeamMember } from '@shared/contracts/team/TeamMember';

export function resolveIdentity(teamMember: TeamMember): ResolvedIdentity | undefined {
    if (teamMember.type === 'Name') {
        return {
            kind: 'Manual',
            name: teamMember.name,
            memberRef: undefined,
            guestRef: undefined,
        };
    }

    if (teamMember.type === 'Member') {
        return {
            kind: 'Member',
            name: teamMember.nickname,
            memberRef: teamMember.id,
            guestRef: undefined,
        };
    }

    if (teamMember.type === 'Guest') {
        return {
            kind: 'Guest',
            name: teamMember.nickname,
            memberRef: undefined,
            guestRef: teamMember.id,
        };
    }

    return undefined;
}
