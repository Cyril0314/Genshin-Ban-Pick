import type { TeamMember } from '../team/TeamMember';

export interface IPlayerCharacterUsage {
    teamMember: TeamMember;
    characterCounts: Record<string, number>;
}
