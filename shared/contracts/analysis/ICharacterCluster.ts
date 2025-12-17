import type { IArchetypePoint } from "./IArchetypePoint";
import type { IBridgeScoreResult } from "./IBridgeScoreResult";

export interface ICharacterCluster {
    archetypePoints: IArchetypePoint[],
    bridgeScores: IBridgeScoreResult[],
    clusterMedoids: IArchetypePoint[],
}
