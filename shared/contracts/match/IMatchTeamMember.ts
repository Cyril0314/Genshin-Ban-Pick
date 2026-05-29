import type { IMatchMemberUser } from "./IMatchMemberUser";
import type { IMatchLineupSlot } from "./IMatchLineupSlot";

export interface IMatchTeamMember {
    id: number;
    slot: number;
    name: string;

    teamId: number;
    memberRef?: number;
    guestRef?: number;

    lineupSlots?: IMatchLineupSlot[];

    member?: IMatchMemberUser;
    guest?: IMatchMemberUser;
}
