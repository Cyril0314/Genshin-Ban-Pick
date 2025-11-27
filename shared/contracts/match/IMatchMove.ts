import { ICharacter } from "../character/ICharacter";
import { IRandomMoveContext } from "./IRandomMoveContext";
import { MoveSource, MoveType } from "./value-types";

export interface IMatchMove {
    id: number;
    order: number;
    type: MoveType;
    source: MoveSource;

    matchId: number;
    teamId?: number | null;
    characterKey: string;

    character: ICharacter | null;
    randomMoveContext: IRandomMoveContext | null;
}