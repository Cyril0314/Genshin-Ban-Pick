// backend/src/services/analysis/tactical/types/IMoveContext.ts

import { MoveType, MoveSource } from '@prisma/client';

export interface IMoveContext {
    type: MoveType;
    source: MoveSource;
    wasUsed?: boolean;
    usedByBothTeams?: boolean;
}