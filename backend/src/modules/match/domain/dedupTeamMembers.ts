// src/modules/match/domain/dedupTeamMembers.ts

import { stringifyPlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

import type { TeamMember } from '@shared/contracts/team/TeamMember';

export function dedupTeamMembers(members: TeamMember[]): TeamMember[] {
    const seen = new Map<string, TeamMember>();
    for (const m of members) {
        const key = stringifyPlayerIdentity(m);
        if (!seen.has(key)) seen.set(key, m);
    }
    return Array.from(seen.values());
}
