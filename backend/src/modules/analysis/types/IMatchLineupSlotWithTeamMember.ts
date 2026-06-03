// src/modules/analysis/types/IMatchLineupSlotWithTeamMember.ts

import type { TeamMember } from "@shared/contracts/team/TeamMember";

export interface IMatchLineupSlotWithTeamMember {
    characterKey: string;
    teamMember: TeamMember;
}