// src/modules/analysis/types/IMatchStatisticsOverview.ts

export interface IMatchStatisticsOverview {
    totalMatches: number;
    totalTacticalUsages: number;

    uniqueCharacters: number;
    uniquePlayers: {
        memberCount: number;
        guestCount: number;
        onlyNameCount: number;
    };

    moves: {
        total: number,
        byType: {
            ban: number,
            pick: number,
            utility: number
        }
        bySource: {
            manual: number
            random: number
        }
    }

    dateRange: {
        from: Date;
        to: Date;
    };
}
