// src/modules/team/domain/createManualMemberDomain.ts

import type { TeamMember } from '@shared/contracts/team/TeamMember';

export function createManualMemberDomain(name: string): TeamMember {
    return { type: 'Manual', name };
}