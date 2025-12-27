import type { MatchTeamMemberUniqueIdentityKey } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export function parsePlayerIdentityQuery(query: any): MatchTeamMemberUniqueIdentityKey | undefined {
    const { type, id, name } = query;

    if (type === 'name') {
        if (typeof name !== 'string' || name.length === 0) return undefined;
        return { type: 'Name', name };
    }

    if (type === 'member' || type === 'guest') {
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) return undefined;

        return {
            type: type === 'member' ? 'Member' : 'Guest',
            id: numericId,
        };
    }

    return undefined;
}
