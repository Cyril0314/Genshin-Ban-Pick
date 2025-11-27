import { IMatchMemberUser } from "./IMatchMemberUser";
import { IMatchTacticalUsage } from "./IMatchTacticalUsage";

export interface IMatchTeamMember {
    id: number;
    slot: number;
    name: string;

    teamId: number;
    memberRef?: number | null;
    guestRef?: number | null;

    tacticalUsages: IMatchTacticalUsage[];

    member: IMatchMemberUser | null;
    guest: IMatchMemberUser | null;
}