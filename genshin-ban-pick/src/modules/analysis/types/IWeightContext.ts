// src/modules/analysis/types/IWeightContext.ts

interface IPickContext {
    total: number;
    manualUsed: number;
    manualNotUsed: number;
    randomUsed: number;
    randomNotUsed: number;
}

interface IBanContext {
    total: number;
    manual: number;
    random: number;
}

interface IUtilityContext {
    total: number;
    manualNotUsed: number;
    manualUsedOneSide: number;
    manualUsedBothSides: number;
    randomNotUsed: number;
    randomUsedOneSide: number;
    randomUsedBothSides: number;
}

export interface IWeightContext {
    pick: IPickContext;
    ban: IBanContext;
    utility: IUtilityContext;
}