// src/modules/lineup/domain/handleLineupImagePlaceDomain.ts

import { findCellIdByImageIdDomain } from './findCellIdByImageIdDomain';
import { placeImageDomain } from './placeImageDomain';
import { removeImageDomain } from './removeImageDomain';

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export function handleLineupImagePlaceDomain(lineupImageMap: LineupImageMap, cellId: number, imgId: string) {
    let nextMap = { ...lineupImageMap };

    const previousCellId = findCellIdByImageIdDomain(nextMap, imgId);
    const displacedImgId = nextMap[cellId];

    // 移除原本出現的位置
    if (previousCellId !== undefined) {
        nextMap = removeImageDomain(nextMap, previousCellId);
    }

    // 移除被擠掉的圖片
    if (displacedImgId !== undefined) {
        nextMap = removeImageDomain(nextMap, cellId);
    }

    // 若兩邊都有圖片且 cell 不相同 → 交換
    if (previousCellId !== undefined && displacedImgId !== undefined && previousCellId !== cellId) {
        nextMap = placeImageDomain(nextMap, previousCellId, displacedImgId);
    }

    // 最後放置新圖片
    nextMap = placeImageDomain(nextMap, cellId, imgId)

    return nextMap
}
