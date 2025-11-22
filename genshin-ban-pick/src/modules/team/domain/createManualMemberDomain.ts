// src/modules/team/domain/createManualMemberDomain.ts

import type { TeamMember } from "../types/TeamMember";

export function createManualMemberDomain(name: string): TeamMember {
    return { type: 'Manual', name };
}