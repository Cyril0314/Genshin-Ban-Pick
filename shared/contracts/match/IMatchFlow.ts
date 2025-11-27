import type { IMatchStep } from "./IMatchStep";

export interface IMatchFlow {
    version: number;
    steps: IMatchStep[];
}