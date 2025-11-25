// backend/src/modules/analyses/application/clustering/types/IBridgeScoreResult.ts

export interface IBridgeScoreResult {
    characterKey: string;
    boundary: number;
    betweenness: number;
    cross: number;
    bridgeScore: number;
}