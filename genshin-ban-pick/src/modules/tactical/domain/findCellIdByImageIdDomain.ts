// src/modules/tactical/domain/findCellIdByImageIdDomain.ts

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function findCellIdByImageIdDomain(tacticalCellImageMap: TacticalCellImageMap, imgId: string): number | undefined {
    const value = Object.entries(tacticalCellImageMap).find(([, f]) => f === imgId);
    if (!value) {
        return undefined;
    }
    return Number(value[0]);
}
