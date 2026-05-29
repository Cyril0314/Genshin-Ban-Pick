// backend/src/modules/lineup/domain/placeImage.ts

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export function placeImage(lineupImageMap: LineupImageMap, cellId: number, imgId: string): Record<number, string> {
    return {
        ...lineupImageMap,
        [cellId]: imgId,
    };
}
