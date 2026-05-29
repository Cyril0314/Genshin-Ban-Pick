// src/modules/team/domain/findMyTeamSlotDomain.ts

import { isSameIdentity } from '@shared/contracts/identity/Identity';

import type { Identity } from '@shared/contracts/identity/Identity';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function findMyTeamSlot(map: TeamMembersMap, identity: Identity): number | undefined {
    for (const [teamSlot, members] of Object.entries(map)) {
        const found = Object.values(members).find(
            (m) => m.type !== 'Name' && isSameIdentity(m, identity),
        );
        if (found) return Number(teamSlot);
    }
    return undefined;
}
