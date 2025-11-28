import type { IMatchMove } from "./IMatchMove";
import type { IMatchTeam } from "./IMatchTeam";

export interface IMatch {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    flowVersion: number;

    teams: IMatchTeam[] | null;
    moves: IMatchMove[] | null;
}