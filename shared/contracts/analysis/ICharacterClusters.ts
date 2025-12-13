import type { IArchetypePoint } from "./IArchetypePoint";
import type { IBridgeScoreResult } from "./IBridgeScoreResult";

export interface ICharacterClusters {
    archetypePoints: IArchetypePoint[],
    bridgeScores: IBridgeScoreResult[],
    clusterMedoids: IArchetypePoint[],
}
