// backend/src/modules/analysis/domain/ICommunityScanResult.ts

export interface ICommunityScanResult {
    resolution: number;
    clusters: number;
    modularity: number;
}