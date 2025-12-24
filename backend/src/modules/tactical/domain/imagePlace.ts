// backend/src/modules/tactical/domain/imagePlace.ts

import { findCellIdByImageId } from './findCellIdByImageId';
import { placeCellImage } from './placeCellImage';
import { removeCellImage } from './removeCellImage';

import type { TacticalCellImageMap } from '@shared/contracts/tactical/TacticalCellImageMap';

export function imagePlace(tacticalCellImageMap: TacticalCellImageMap, cellId: number, imgId: string) {
    let nextMap = { ...tacticalCellImageMap };

    const previousCellId = findCellIdByImageId(nextMap, imgId);
    const displacedImgId = nextMap[cellId] ?? undefined;

    // 移除原本出現的位置
    if (previousCellId !== undefined) {
        nextMap = removeCellImage(nextMap, previousCellId);
    }

    // 移除被擠掉的圖片
    if (displacedImgId !== undefined) {
        nextMap = removeCellImage(nextMap, cellId);
    }

    // 若兩邊都有圖片且 cell 不相同 → 交換
    if (previousCellId !== undefined && displacedImgId !== undefined && previousCellId !== cellId) {
        nextMap = placeCellImage(nextMap, previousCellId, displacedImgId);
    }

    // 最後放置新圖片
    nextMap = placeCellImage(nextMap, cellId, imgId);

    return nextMap;
}
