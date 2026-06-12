// src/modules/team/domain/buildTeamMemberToTeamSlotMap.ts

import { stringifyPlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function buildTeamMemberToTeamSlotMap(teamMembersMap: TeamMembersMap): Record<string, number> {
    const map: Record<string, number> = {};
    for (const [teamSlot, members] of Object.entries(teamMembersMap)) {
        for (const m of Object.values(members)) {
            map[stringifyPlayerIdentity(m)] = Number(teamSlot);
        }
    }
    return map;
}
