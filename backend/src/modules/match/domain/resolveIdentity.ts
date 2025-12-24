// backend/src/modules/match/domain/resolveIdentity.ts

import type { ResolvedIdentity } from "../types/ResolvedIdentity";
import type { TeamMember } from '@shared/contracts/team/TeamMember';

export function resolveIdentity(teamMember: TeamMember): ResolvedIdentity | undefined {
    if (teamMember.type === 'Manual') {
        return {
            kind: 'Manual',
            name: teamMember.name,
            memberRef: undefined,
            guestRef: undefined,
        };
    }

    // Online user → parse identityKey = "Member:12" or "Guest:5"
    const { identityKey, nickname } = teamMember.user;
    const [type, idStr] = identityKey.split(':');
    const id = Number(idStr);

    if (type === 'Member') {
        return {
            kind: 'Member',
            name: nickname,
            memberRef: id,
            guestRef: undefined,
        };
    }

    if (type === 'Guest') {
        return {
            kind: 'Guest',
            name: nickname,
            memberRef: undefined,
            guestRef: id,
        };
    }

    return undefined;
}
