// src/modules/board/domain/findZoneIdByImageIdDomain.ts

export function findZoneIdByImageIdDomain(
    boardImageMap: Record<number, string>,
    imgId: string
): number | null {
    for (const [zoneId, id] of Object.entries(boardImageMap)) {
        if (id === imgId) {
            return Number(zoneId);
        }
    }
    return null;
}