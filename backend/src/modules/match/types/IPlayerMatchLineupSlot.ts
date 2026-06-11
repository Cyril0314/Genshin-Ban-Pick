// src/modules/match/types/IPlayerMatchLineupSlot.ts

import type { TeamMember } from '@shared/contracts/team/TeamMember';

export interface IPlayerMatchLineupSlot {
    characterKey: string;
    teamMember: TeamMember;
}
