// src/modules/match/types/IMatchStatistics.ts

import type { Element, Rarity } from '@shared/contracts/character/value-types';
import type { MoveSource, MoveType } from '@shared/contracts/match/value-types';

export interface IMatchStatistics {
    matchCount: number;
    moveCount: number;

    characterRarityCounts: Partial<Record<Rarity, number>>;
    characterElementCounts: Partial<Record<Element, number>>;
    moveTypeCounts: Partial<Record<MoveType, number>>;
    moveSourceCounts: Partial<Record<MoveSource, number>>;
}
