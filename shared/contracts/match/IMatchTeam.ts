import { IMatchTeamMember } from "./IMatchTeamMember";

export interface IMatchTeam {
    id: number;
    slot: number;
    name?: string | null;
    matchId: number;

    teamMembers: IMatchTeamMember[] | null;
}
