// src/modules/match/domain/IMatchFlow.ts

export interface IMatchFlow {
    version: number;
    steps: IMatchStep[];
}

export interface IMatchStep {
    index: number;
    zoneId: number;
    teamSlot: number | null;
}
