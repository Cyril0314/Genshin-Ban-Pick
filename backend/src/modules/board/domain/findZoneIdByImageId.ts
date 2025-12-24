// backend/src/modules/board/domain/findZoneIdByImageId.ts

import type { BoardImageMap } from "@shared/contracts/board/BoardImageMap";

export function findZoneIdByImageId(
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