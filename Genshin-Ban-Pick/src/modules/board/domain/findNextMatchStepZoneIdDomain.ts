// src/modules/board/domain/findNextMatchStepZoneIdDomain.ts

import type { IMatchStep } from '@shared/contracts/match/IMatchStep';
import type { IZone } from '@shared/contracts/board/IZone';
import type { ZoneType } from '@shared/contracts/board/value-types';
import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';

export function findNextMatchStepZoneIdDomain(
    zoneType: ZoneType,
    matchSteps: IMatchStep[],
    zoneMetaTable: Record<number, IZone>,
    boardImageMap: BoardImageMap,
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
