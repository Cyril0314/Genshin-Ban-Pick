// src/modules/tactical/domain/handleTacticalCellImagePlaceDomain.ts

import { findCellIdByImageIdDomain } from './findCellIdByImageIdDomain';
import { placeCellImageDomain } from './placeCellImageDomain';
import { removeCellImageDomain } from './removeCellImageDomain';

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function handleTacticalCellImagePlaceDomain(tacticalCellImageMap: TacticalCellImageMap, cellId: number, imgId: string) {
    let nextMap = { ...tacticalCellImageMap };

    const previousCellId = findCellIdByImageIdDomain(nextMap, imgId);
    const displacedImgId = nextMap[cellId] ?? null;

    // 移除原本出現的位置
    if (previousCellId !== null) {
        nextMap = removeCellImageDomain(nextMap, previousCellId);
    }

    // 移除被擠掉的圖片
    if (displacedImgId !== null) {
        nextMap = removeCellImageDomain(nextMap, cellId);
    }

    // 若兩邊都有圖片且 cell 不相同 → 交換
    if (previousCellId !== null && displacedImgId !== null && previousCellId !== cellId) {
        nextMap = placeCellImageDomain(nextMap, previousCellId, displacedImgId);
    }

    // 最後放置新圖片
    nextMap = placeCellImageDomain(nextMap, cellId, imgId)

    return nextMap
}
