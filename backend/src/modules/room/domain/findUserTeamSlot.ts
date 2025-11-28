// backend/src/modules/room/domain/findUserTeamSlot.ts

import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function findUserTeamSlot(teamMembersMap: TeamMembersMap, identityKey: string) {
    const userTeamSlot = Object.entries(teamMembersMap).find(([teamSlot, members]) => {
        const memberValues = Object.values(members);
        if (memberValues.some((m) => m.type === 'Online' && m.user.identityKey === identityKey)) {
            return true;
        } else {
            return false;
        }
    })?.[0];
    return userTeamSlot
}
