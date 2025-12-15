// src/modules/analysis/types/IMatchMoveWeightCalcCore.ts

import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';
import type { MoveSource, MoveType } from '@shared/contracts/match/value-types';

export interface IMatchMoveWeightCalcCore {
    characterKey: string;
    type: MoveType;
    source: MoveSource;
    matchId: number;
    order: number;
    characterReleaseDate: Date | null;
    randomMoveContext: {
        id: number;
        filters: Record<CharacterFilterKey, string[]>;
        matchMoveId: number;
    } | null;
}
