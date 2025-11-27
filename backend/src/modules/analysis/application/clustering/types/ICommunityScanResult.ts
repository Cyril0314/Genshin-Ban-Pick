// backend/src/modules/analysis/application/clustering/types/ICommunityScanResult.ts

export interface ICommunityScanResult {
    resolution: number;
    clusters: number;
    modularity: number;
}