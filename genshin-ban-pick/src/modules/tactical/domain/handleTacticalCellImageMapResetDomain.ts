// src/modules/board/domain/handleTacticalCellImageMapResetDomain.ts

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function handleTacticalCellImageMapResetDomain(tacticalCellImageMap: TacticalCellImageMap) {
    let nextMap = { ...tacticalCellImageMap };
    nextMap = {}
    return nextMap
}