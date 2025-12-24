import type { IMatchMemberUser } from "./IMatchMemberUser";
import type { IMatchTacticalUsage } from "./IMatchTacticalUsage";

export interface IMatchTeamMember {
    id: number;
    slot: number;
    name: string;

    teamId: number;
    memberRef?: number;
    guestRef?: number;

    tacticalUsages: IMatchTacticalUsage[];

    member?: IMatchMemberUser;
    guest?: IMatchMemberUser;
}