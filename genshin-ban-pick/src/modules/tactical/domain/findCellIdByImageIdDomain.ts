// src/modules/tactical/domain/findCellIdByImageIdDomain.ts

import type { TacticalCellImageMap } from '../types/TacticalCellImageMap';

export function findCellIdByImageIdDomain(tacticalCellImageMap: TacticalCellImageMap, imgId: string): number | null {
    const value = Object.entries(tacticalCellImageMap).find(([, f]) => f === imgId);
    if (!value) {
        console.debug('[TATICAL DOMAIN] Cannot find cell id by image id', imgId);
        return null;
    }
    console.debug('[TATICAL DOMAIN] Find cell id by image id', value[0], imgId);
    return Number(value[0]);
}
