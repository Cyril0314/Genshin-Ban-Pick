import { UserNotFoundError } from "../../../errors/AppError.ts";
import { TeamMember } from "../../../types/TeamMember.ts";
import { ResolvedIdentity } from "../types/ResolvedIdentity.ts";

export function resolveIdentity(teamMember: TeamMember): ResolvedIdentity {
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

    throw new UserNotFoundError();
}
