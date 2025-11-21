// src/modules/board/domain/handleBoardImageDropDomain.ts

import { findZoneIdByImageIdDomain } from './findZoneIdByImageIdDomain';
import { placeImageDomain } from './placeImageDomain';
import { removeImageDomain } from './removeImageDomain';

export function handleBoardImageDropDomain(
    boardImageMap: Record<number, string>,
    zoneId: number,
    imgId: string,
): Record<number, string> {
    let nextMap = { ...boardImageMap };

    const previousZoneId = findZoneIdByImageIdDomain(nextMap, imgId);
    const displacedImgId = nextMap[zoneId];

    // 移除原本出現的位置
    if (previousZoneId !== null) {
        nextMap = removeImageDomain(nextMap, previousZoneId)
    }

    // 移除被擠掉的圖片
    if (displacedImgId !== undefined) {
        nextMap = removeImageDomain(nextMap, zoneId)
    }

    // 若兩邊都有圖片且 zone 不相同 → 交換
    if (previousZoneId !== null && displacedImgId !== undefined && previousZoneId !== zoneId) {
        nextMap = placeImageDomain(nextMap, previousZoneId, displacedImgId)
    }

    // 最後放置新圖片
    nextMap = placeImageDomain(nextMap, zoneId, imgId)
    
    return nextMap;
}
