// src/modules/board/domain/placeImageDomain.ts

export function placeImageDomain(
    boardImageMap: Record<number, string>,
    zoneId: number,
    imgId: string
): Record<number, string> {
    return {
        ...boardImageMap,
        [zoneId]: imgId,
    };
}