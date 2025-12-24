// src/modules/tactical/domain/handleTacticalCellImagePlaceDomain.ts

import { findCellIdByImageIdDomain } from './findCellIdByImageIdDomain';
import { placeCellImageDomain } from './placeCellImageDomain';
import { removeCellImageDomain } from './removeCellImageDomain';

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function handleTacticalCellImagePlaceDomain(tacticalCellImageMap: TacticalCellImageMap, cellId: number, imgId: string) {
    let nextMap = { ...tacticalCellImageMap };

    const previousCellId = findCellIdByImageIdDomain(nextMap, imgId);
    const displacedImgId = nextMap[cellId];

    // 移除原本出現的位置
    if (previousCellId !== undefined) {
        nextMap = removeCellImageDomain(nextMap, previousCellId);
    }

    // 移除被擠掉的圖片
    if (displacedImgId !== undefined) {
        nextMap = removeCellImageDomain(nextMap, cellId);
    }

    // 若兩邊都有圖片且 cell 不相同 → 交換
    if (previousCellId !== undefined && displacedImgId !== undefined && previousCellId !== cellId) {
        nextMap = placeCellImageDomain(nextMap, previousCellId, displacedImgId);
    }

    // 最後放置新圖片
    nextMap = placeCellImageDomain(nextMap, cellId, imgId)

    return nextMap
}
