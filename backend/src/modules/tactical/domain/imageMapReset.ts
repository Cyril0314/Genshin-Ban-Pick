// backend/src/modules/board/domain/imageMapReset.ts

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function imageMapReset(tacticalCellImageMap: TacticalCellImageMap) {
    let nextMap = { ...tacticalCellImageMap };
    nextMap = {}
    return nextMap
}