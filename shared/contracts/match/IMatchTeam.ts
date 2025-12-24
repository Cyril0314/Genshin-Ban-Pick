import type { IMatchTeamMember } from "./IMatchTeamMember";

export interface IMatchTeam {
    id: number;
    slot: number;
    name?: string;
    matchId: number;

    teamMembers?: IMatchTeamMember[];
}
