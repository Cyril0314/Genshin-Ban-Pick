export interface IAnalysisOverview {
    volume: OverviewVolume;
    activity: OverviewActivity;
}

interface OverviewVolume {
    matchCount: number;
    player: {
      total: number;
      member: number;
      guest: number;
      onlyName: number;
    };
    characterCount: number;
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

interface OverviewActivity {
    earliestMatchAt: string;
    latestMatchAt: string;
}
