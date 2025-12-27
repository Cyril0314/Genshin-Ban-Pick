// src/modules/analysis/types/IMatchStatisticsOverview.ts

export interface IMatchStatisticsOverview {
    totalMatches: number;
    uniqueCharacterCombinations: number;
    uniqueTeamMemberCombinations: number;

    uniqueCharacters: {
        total: number;
        byRarity: {
            fourStar: number;
            fiveStar: number;
        };
        byElement: {
            anemo: number;
            geo: number;
            electro: number;
            dendro: number;
            hydro: number;
            pryo: number;
            cryo: number
            none: number
        };
    };

    uniquePlayers: {
        member: number;
        guest: number;
        onlyName: number;
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

    versionSpan: {
        total: number;
        from: IVersion;
        to: IVersion;
    }
}

interface IVersion {
    name: string
    code: string
}