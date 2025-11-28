// backend/src/modules/analysis/domain/IMoveContext.ts

import type { MoveSource, MoveType } from "@shared/contracts/match/value-types";

export interface IMoveContext {
    type: MoveType;
    source: MoveSource;
    wasUsed?: boolean;
    usedByBothTeams?: boolean;
}