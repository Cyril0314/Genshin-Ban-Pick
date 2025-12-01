// src/modules/tactical/domain/removeCellImageDomain.ts

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function removeCellImageDomain(tacticalCellImageMap: TacticalCellImageMap, cellId: number): Record<number, string> {
    const newMap = { ...tacticalCellImageMap };
    delete newMap[cellId];
    return newMap;
}
