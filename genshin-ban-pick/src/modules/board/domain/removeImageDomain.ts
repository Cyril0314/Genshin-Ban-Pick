// src/modules/board/domain/removeImageDomain.ts

export function removeImageDomain(
    boardImageMap: Record<number, string>,
    zoneId: number
): Record<number, string> {
    const newMap = { ...boardImageMap };
    delete newMap[zoneId];
    return newMap;
}