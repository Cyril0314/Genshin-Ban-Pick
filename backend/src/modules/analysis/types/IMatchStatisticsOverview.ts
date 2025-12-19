// src/modules/analysis/types/IMatchStatisticsOverview.ts

export interface IMatchStatisticsOverview {
    totalMatches: number;
    totalMoves: number;
    totalTacticalUsages: number;

    uniqueCharacters: number;
    uniquePlayers: number;

    dateRange: {
        from: Date;
        to: Date;
    };
}
