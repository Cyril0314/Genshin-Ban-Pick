// src/modules/lineup/domain/findCellIdByImageIdDomain.ts

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export function findCellIdByImageIdDomain(lineupImageMap: LineupImageMap, imgId: string): number | undefined {
    const value = Object.entries(lineupImageMap).find(([, f]) => f === imgId);
    if (!value) {
        return undefined;
    }
    return Number(value[0]);
}
