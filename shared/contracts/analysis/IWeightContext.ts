import type { IBanContext } from "./IBanContext";
import type { IPickContext } from "./IPickContext";
import type { IUtilityContext } from "./IUtilityContext";

export interface IWeightContext {
    pick: IPickContext;
    ban: IBanContext;
    utility: IUtilityContext;
}