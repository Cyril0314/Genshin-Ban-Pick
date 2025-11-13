// backend/src/services/analysis/clustering/types/ICommunityScanResult.ts

export interface ICommunityScanResult {
    resolution: number;
    clusters: number;
    modularity: number;
}