// src/modules/tactical/domain/handleTacticalCellImageRemoveDomain.ts

import { removeCellImageDomain } from './removeCellImageDomain';

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function handleTacticalCellImageRemoveDomain(tacticalCellImageMap: TacticalCellImageMap, cellId: number) {
    let nextMap = { ...tacticalCellImageMap };
    nextMap = removeCellImageDomain(nextMap, cellId)
    return nextMap
}
