// src/modules/board/domain/removeImageDomain.ts

import type { BoardImageMap } from "@shared/contracts/board/BoardImageMap";

export function removeImageDomain(
    boardImageMap: BoardImageMap,
    zoneId: number
): BoardImageMap {
    const newMap = { ...boardImageMap };
    delete newMap[zoneId];
    return newMap;
}