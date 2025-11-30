// src/modules/board/domain/handleBoardImageMapResetDomain.ts

import type { BoardImageMap } from "@shared/contracts/board/BoardImageMap";

export function handleBoardImageMapResetDomain(boardImageMap: BoardImageMap): BoardImageMap {
    let nextMap = { ...boardImageMap };
    nextMap = {}
    return nextMap
}