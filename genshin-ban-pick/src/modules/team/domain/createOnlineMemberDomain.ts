// src/modules/team/domain/createOnlineMemberDomain.ts

import type { IRoomUser } from '@/modules/room';
import type { TeamMember } from '../types/TeamMember';

export function createOnlineMemberDomain(user: IRoomUser): TeamMember {
    return { type: 'Online', user };
}
