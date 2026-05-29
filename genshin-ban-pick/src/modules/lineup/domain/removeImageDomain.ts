// src/modules/lineup/domain/removeImageDomain.ts

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export function removeImageDomain(lineupImageMap: LineupImageMap, cellId: number): Record<number, string> {
    const newMap = { ...lineupImageMap };
    delete newMap[cellId];
    return newMap;
}
