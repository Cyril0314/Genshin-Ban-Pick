// backend/src/modules/lineup/domain/findCellIdByImageId.ts

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export function findCellIdByImageId(lineupImageMap: LineupImageMap, imgId: string): number | undefined {
    const value = Object.entries(lineupImageMap).find(([, f]) => f === imgId);
    if (!value) {
        return undefined;
    }
    return Number(value[0]);
}
