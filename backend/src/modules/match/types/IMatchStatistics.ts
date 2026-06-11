// src/modules/match/types/IMatchStatistics.ts

import type { Element, Rarity } from '@shared/contracts/character/value-types';
import type { MoveSource, MoveType } from '@shared/contracts/match/value-types';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export interface IMatchStatistics {
    matchCount: number;
    moveCount: number;

    teamMemberGroups: PlayerIdentity[][];

    characterRarityCounts: Partial<Record<Rarity, number>>;
    characterElementCounts: Partial<Record<Element, number>>;
    moveTypeCounts: Partial<Record<MoveType, number>>;
    moveSourceCounts: Partial<Record<MoveSource, number>>;
}
