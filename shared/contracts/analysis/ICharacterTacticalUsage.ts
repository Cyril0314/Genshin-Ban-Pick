import type { IWeightContext } from "./IWeightContext";

export interface ICharacterTacticalUsage {
    characterKey: string;
    tacticalUsage: number;
    globalUsage: number;
    effectiveUsage: number;
    validMatchCount: number;
    context: IWeightContext;
}