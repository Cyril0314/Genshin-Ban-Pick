// backend/src/modules/tactical/domain/removeCellImage.ts

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function removeCellImage(tacticalCellImageMap: TacticalCellImageMap, cellId: number): Record<number, string> {
    const newMap = { ...tacticalCellImageMap };
    delete newMap[cellId];
    return newMap;
}
