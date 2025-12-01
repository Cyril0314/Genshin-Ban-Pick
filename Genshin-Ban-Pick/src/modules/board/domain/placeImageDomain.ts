// src/modules/board/domain/placeImageDomain.ts

import type { BoardImageMap } from "@shared/contracts/board/BoardImageMap";

export function placeImageDomain(
    boardImageMap: BoardImageMap,
    zoneId: number,
    imgId: string
): BoardImageMap {
    return {
        ...boardImageMap,
        [zoneId]: imgId,
    };
}