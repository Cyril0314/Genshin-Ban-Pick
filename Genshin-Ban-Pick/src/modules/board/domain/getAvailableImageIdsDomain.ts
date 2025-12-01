// src/modules/board/domain/getAvailableImageIdsDomain.ts

import type { BoardImageMap } from "@shared/contracts/board/BoardImageMap";

export function getAvailableImageIdsDomain(boardImageMap: BoardImageMap, filteredCharacterKeys: string[]) {
    const usedImageIds = [...new Set(Object.values(boardImageMap).map((imgId) => imgId))];
    const availableIds = filteredCharacterKeys.filter((key) => !usedImageIds.includes(key));
    return availableIds;
}
