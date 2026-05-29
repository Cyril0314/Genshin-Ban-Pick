// src/modules/team/domain/buildUserToTeamSlotMap.ts

import { stringifyPlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

// Flattens `teamSlot → memberSlot → TeamMember` into a flat lookup
// `stringifiedIdentity → teamSlot`. Skips Name-only members (no identity).
// Pure: same map in → same map out. Lives in team/ because it encodes
// team-side knowledge (members can be Identity or Name).
export function buildUserToTeamSlotMap(teamMembersMap: TeamMembersMap): Record<string, number> {
    const map: Record<string, number> = {};
    for (const [teamSlot, members] of Object.entries(teamMembersMap)) {
        for (const m of Object.values(members)) {
            if (m.type !== 'Name') {
                map[stringifyPlayerIdentity(m)] = Number(teamSlot);
            }
        }
    }
    return map;
}
