// src/modules/board/domain/getAvailableImageIds.ts

export function getAvailableImageIds(boardImageMap: Record<number, string>, filteredCharacterKeys: string[]) {
    const usedImageIds = [...new Set(Object.values(boardImageMap).map((imgId) => imgId))];
    const availableIds = filteredCharacterKeys.filter((key) => !usedImageIds.includes(key));
    return availableIds;
}
