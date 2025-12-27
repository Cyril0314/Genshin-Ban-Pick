export interface IAnalysisOverview {
    volume: IOverviewVolume;
    activity: IOverviewActivity;
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
}

interface IOverviewActivity {
    earliestMatchAt: string;
    latestMatchAt: string;
    versionSpan: {
        total: number;
        from: IVersion;
        to: IVersion;
    };
}

interface IVersion {
    name: string
    code: string
}