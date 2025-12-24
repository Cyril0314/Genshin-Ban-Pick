// src/modules/board/domain/findZoneIdByImageIdDomain.ts

import type { BoardImageMap } from "@shared/contracts/board/BoardImageMap";

export function findZoneIdByImageIdDomain(
    boardImageMap: BoardImageMap,
    imgId: string
): number | undefined {
    for (const [zoneId, id] of Object.entries(boardImageMap)) {
        if (id === imgId) {
            return Number(zoneId);
        }
    }
    return undefined;
}