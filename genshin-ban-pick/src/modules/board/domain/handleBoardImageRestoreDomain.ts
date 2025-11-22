// src/modules/board/domain/handleBoardImageRestoreDomain.ts

import { removeImageDomain } from "./removeImageDomain";

export function handleBoardImageRestoreDomain(
    boardImageMap: Record<number, string>,
    zoneId: number,
):  Record<number, string> {
    let nextMap = { ...boardImageMap };
    nextMap = removeImageDomain(nextMap, zoneId)
    return nextMap;
}
