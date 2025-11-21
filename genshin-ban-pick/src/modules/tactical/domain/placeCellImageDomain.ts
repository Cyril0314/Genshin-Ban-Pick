// src/modules/tactical/domain/placeCellImageDomain.ts

import type { TacticalCellImageMap } from '../types/TacticalCellImageMap';

export function placeCellImageDomain(tacticalCellImageMap: TacticalCellImageMap, cellId: number, imgId: string): Record<number, string> {
    return {
        ...tacticalCellImageMap,
        [cellId]: imgId,
    };
}
