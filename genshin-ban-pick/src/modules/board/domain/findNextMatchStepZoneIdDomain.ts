// src/modules/board/domain/findNextMatchStepZoneIdDomain.ts

import type { IMatchStep } from '../types/IMatchFlow';
import type { IZone, ZoneType } from '../types/IZone';

export function findNextMatchStepZoneIdDomain(
    zoneType: ZoneType,
    matchSteps: IMatchStep[],
    zoneMetaTable: Record<number, IZone>,
    boardImageMap: Record<number, string>,
): number | null {
    const step = matchSteps.find((step: IMatchStep) => {
        const zone = zoneMetaTable[step.zoneId];
        return zone.type === zoneType && !boardImageMap[step.zoneId];
    });
    if (!step) {
        console.warn(`[RANDOM PULL] Cannot find next ${zoneType} step `);
        return null;
    }
    return step.zoneId;
}
