// src/modules/lineup/domain/placeImageDomain.ts

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export function placeImageDomain(lineupImageMap: LineupImageMap, cellId: number, imgId: string): Record<number, string> {
    return {
        ...lineupImageMap,
        [cellId]: imgId,
    };
}
