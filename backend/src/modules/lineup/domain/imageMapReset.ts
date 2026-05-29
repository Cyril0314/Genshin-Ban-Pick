// backend/src/modules/lineup/domain/imageMapReset.ts

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export function imageMapReset(lineupImageMap: LineupImageMap) {
    let nextMap = { ...lineupImageMap };
    nextMap = {}
    return nextMap
}
