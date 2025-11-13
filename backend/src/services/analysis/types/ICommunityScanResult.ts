// backend/src/services/analysis/types/ICommunityScanResult.ts

export interface ICommunityScanResult {
    resolution: number;
    clusters: number;
    modularity: number;
}