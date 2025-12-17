export interface IAnalysisOverview {
  volume: OverviewVolume
  activity: OverviewActivity
}

interface OverviewVolume {
  matchCount: number
  playerCount: number
  characterCount: number
  tacticalUsageCount: number
}

interface OverviewActivity {
  latestMatchAt: string
}

