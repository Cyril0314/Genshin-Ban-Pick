import { IMatchMove } from "./IMatchMove";
import { IMatchTeam } from "./IMatchTeam";

export interface IMatch {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    flowVersion: number;

    teams: IMatchTeam[] | null;
    moves: IMatchMove[] | null;
}