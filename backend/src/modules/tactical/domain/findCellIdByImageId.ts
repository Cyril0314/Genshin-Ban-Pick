// backend/src/modules/tactical/domain/findCellIdByImageId.ts

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function findCellIdByImageId(tacticalCellImageMap: TacticalCellImageMap, imgId: string): number | undefined {
    const value = Object.entries(tacticalCellImageMap).find(([, f]) => f === imgId);
    if (!value) {
        return undefined;
    }
    return Number(value[0]);
}
