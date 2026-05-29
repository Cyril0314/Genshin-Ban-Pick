// src/modules/lineup/domain/handleLineupImageRemoveDomain.ts

import { removeImageDomain } from './removeImageDomain';

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export function handleLineupImageRemoveDomain(lineupImageMap: LineupImageMap, cellId: number) {
    let nextMap = { ...lineupImageMap };
    nextMap = removeImageDomain(nextMap, cellId)
    return nextMap
}
