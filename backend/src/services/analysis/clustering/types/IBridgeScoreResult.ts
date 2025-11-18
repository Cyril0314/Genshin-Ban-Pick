// backend/src/services/analysis/clustering/types/IBridgeScoreResult.ts

export interface IBridgeScoreResult {
    characterKey: string;
    boundary: number;
    betweenness: number;
    cross: number;
    bridgeScore: number;
}