import type { IWeightContext } from "./IWeightContext";

export interface ICharacterUsage {
    characterKey: string;
    adjustedUsage: number;
    globalUsage: number;
    effectiveUsage: number;
    validMatchCount: number;
    context: IWeightContext;
}