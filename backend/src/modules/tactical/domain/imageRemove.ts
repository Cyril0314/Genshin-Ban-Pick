// backend/src/modules/tactical/domain/imageRemove.ts

import { removeCellImage } from './removeCellImage';

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function imageRemove(tacticalCellImageMap: TacticalCellImageMap, cellId: number) {
    let nextMap = { ...tacticalCellImageMap };
    nextMap = removeCellImage(nextMap, cellId)
    return nextMap
}
