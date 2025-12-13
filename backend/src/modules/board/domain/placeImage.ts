// backend/src/modules/board/domain/placeImage.ts

import type { BoardImageMap } from "@shared/contracts/board/BoardImageMap";

export function placeImage(
    boardImageMap: BoardImageMap,
    zoneId: number,
    imgId: string
): BoardImageMap {
    return {
        ...boardImageMap,
        [zoneId]: imgId,
    };
}