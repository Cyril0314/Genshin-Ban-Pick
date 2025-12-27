import type { ICharacter } from "../character/ICharacter";
import type { IRandomMoveContext } from "./IRandomMoveContext";
import type { MoveSource, MoveType } from "./value-types";

export interface IMatchMove {
    id: number;
    order: number;
    type: MoveType;
    source: MoveSource;

    matchId: number;
    teamId?: number;
    characterKey: string;

    character?: ICharacter;
    randomMoveContext?: IRandomMoveContext;
}