// src/modules/analysis/types/ITacticalUsages.ts

import type { IWeightContext } from "./IWeightContext";

export interface ITacticalUsages {
    characterKey: string;
    tacticalUsage: number;
    globalUsage: number;
    effectiveUsage: number;
    validMatchCount: number;
    context: IWeightContext;
}