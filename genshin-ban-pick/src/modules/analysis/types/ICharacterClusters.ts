// src/modules/analysis/types/ICharacterClusters.ts

export interface ICharacterClusters {
    archetypePoints: [IArchetypePoint],
    bridgeScores: [IBridgeScoreResult],
    clusterMedoids: [IArchetypePoint],
}

export interface IArchetypePoint {
    characterKey: string;
    clusterId: number;
    x: number;
    y: number;
}

export interface IBridgeScoreResult {
    characterKey: string;
    boundary: number;
    betweenness: number;
    cross: number;
    bridgeScore: number;
}