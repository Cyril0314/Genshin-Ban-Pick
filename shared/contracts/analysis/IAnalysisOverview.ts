import type { Element, Rarity } from '../character/value-types';
import type { MoveSource, MoveType } from '../match/value-types';

export interface IAnalysisOverview {
    volume: IOverviewVolume;
}

interface IOverviewVolume {
    matchCount: number;
    matchCharacterCombinationCount: number;
    matchTeamMemberCombinationCount: number;
    players: {
      total: number;
      member: number;
      guest: number;
      onlyName: number;
    };
    characters: {
        total: number;
        byRarity: Record<Rarity, number>;
        byElement: Record<Element, number>;
    };
    moves: {
        total: number;
        byType: Record<MoveType, number>;
        bySource: Record<MoveSource, number>;
    };
}