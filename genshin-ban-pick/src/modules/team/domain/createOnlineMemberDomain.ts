// src/modules/team/domain/createOnlineMemberDomain.ts

import type { IRoomUser } from '@shared/contracts/room/IRoomUser';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

export function createOnlineMemberDomain(user: IRoomUser): TeamMember {
    return { type: 'Online', user };
}
