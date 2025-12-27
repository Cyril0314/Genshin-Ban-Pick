// backend/src/modules/tactical/domain/findCellIdByImageId.ts

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function findCellIdByImageId(tacticalCellImageMap: TacticalCellImageMap, imgId: string): number | undefined {
    const value = Object.entries(tacticalCellImageMap).find(([, f]) => f === imgId);
    if (!value) {
        console.debug('[TATICAL DOMAIN] Cannot find cell id by image id', imgId);
        return undefined;
    }
    console.debug('[TATICAL DOMAIN] Find cell id by image id', value[0], imgId);
    return Number(value[0]);
}
