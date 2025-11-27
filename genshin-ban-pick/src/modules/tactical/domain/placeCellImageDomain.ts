// src/modules/tactical/domain/placeCellImageDomain.ts

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function placeCellImageDomain(tacticalCellImageMap: TacticalCellImageMap, cellId: number, imgId: string): Record<number, string> {
    return {
        ...tacticalCellImageMap,
        [cellId]: imgId,
    };
}
