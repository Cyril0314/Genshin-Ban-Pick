// backend/src/modules/lineup/domain/removeImage.ts

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export function removeImage(lineupImageMap: LineupImageMap, cellId: number): Record<number, string> {
    const newMap = { ...lineupImageMap };
    delete newMap[cellId];
    return newMap;
}
