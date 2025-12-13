// backend/src/modules/tactical/domain/placeCellImage.ts

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function placeCellImage(tacticalCellImageMap: TacticalCellImageMap, cellId: number, imgId: string): Record<number, string> {
    return {
        ...tacticalCellImageMap,
        [cellId]: imgId,
    };
}
