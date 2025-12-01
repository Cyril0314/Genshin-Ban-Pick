// src/modules/board/domain/handleBoardImageRestoreDomain.ts

import { removeImageDomain } from "./removeImageDomain";

import type { BoardImageMap } from "@shared/contracts/board/BoardImageMap";

export function handleBoardImageRestoreDomain(
    boardImageMap: BoardImageMap,
    zoneId: number,
): BoardImageMap {
    let nextMap = { ...boardImageMap };
    nextMap = removeImageDomain(nextMap, zoneId)
    return nextMap;
}
