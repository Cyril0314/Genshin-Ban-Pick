// backend/src/modules/match/domain/resolveIdentity.ts

import { ResolvedIdentity } from "../types/ResolvedIdentity";
import { TeamMember } from '@shared/contracts/team/TeamMember';

export function resolveIdentity(teamMember: TeamMember): ResolvedIdentity | null {
    if (teamMember.type === 'Manual') {
        return {
            kind: 'Manual',
            name: teamMember.name,
            memberRef: null,
            guestRef: null,
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
            guestRef: null,
        };
    }

    if (type === 'Guest') {
        return {
            kind: 'Guest',
            name: nickname,
            memberRef: null,
            guestRef: id,
        };
    }

    return null;
}
