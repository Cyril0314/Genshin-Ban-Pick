// backend/src/services/analysis/tactical/types/IWeightContext.ts

export interface IWeightContext {
    pick: IPickContext;
    ban: IBanContext;
    utility: IUtilityContext;
}

export interface IPickContext {
    total: number;
    manualUsed: number;
    manualNotUsed: number;
    randomUsed: number;
    randomNotUsed: number;
}

export interface IBanContext {
    total: number;
    manual: number;
    random: number;
}

export interface IUtilityContext {
    total: number;
    manualNotUsed: number;
    manualUsedOneSide: number;
    manualUsedBothSides: number;
    randomNotUsed: number;
    randomUsedOneSide: number;
    randomUsedBothSides: number;
}
