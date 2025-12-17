import type { IWeightContext } from "./IWeightContext";

export interface ICharacterUsage {
    characterKey: string;
    tacticalUsage: number;
    globalUsage: number;
    effectiveUsage: number;
    validMatchCount: number;
    context: IWeightContext;
}