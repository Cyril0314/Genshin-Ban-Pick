export interface IAnalysisOverview {
  volume: OverviewVolume
  activity: OverviewActivity
}

interface OverviewVolume {
  matchCount: number
  playerCount: number
  characterCount: number
}

interface OverviewActivity {
  earliestMatchAt: string
  latestMatchAt: string
}

