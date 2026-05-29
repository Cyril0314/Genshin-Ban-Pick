// backend/src/modules/lineup/domain/imageRemove.ts

import { removeImage } from './removeImage';

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export function imageRemove(lineupImageMap: LineupImageMap, cellId: number) {
    let nextMap = { ...lineupImageMap };
    nextMap = removeImage(nextMap, cellId)
    return nextMap
}
