// backend/src/modules/board/domain/removeImage.ts

import type { BoardImageMap } from "@shared/contracts/board/BoardImageMap";

export function removeImage(
    boardImageMap: BoardImageMap,
    zoneId: number
): BoardImageMap {
    const newMap = { ...boardImageMap };
    delete newMap[zoneId];
    return newMap;
}