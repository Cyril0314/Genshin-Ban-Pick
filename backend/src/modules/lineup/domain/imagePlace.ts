// backend/src/modules/lineup/domain/imagePlace.ts

import { findCellIdByImageId } from './findCellIdByImageId';
import { placeImage } from './placeImage';
import { removeImage } from './removeImage';

import type { LineupImageMap } from '@shared/contracts/lineup/LineupImageMap';

export function imagePlace(lineupImageMap: LineupImageMap, cellId: number, imgId: string) {
    let nextMap = { ...lineupImageMap };

    const previousCellId = findCellIdByImageId(nextMap, imgId);
    const displacedImgId = nextMap[cellId];

    // 移除原本出現的位置
    if (previousCellId !== undefined) {
        nextMap = removeImage(nextMap, previousCellId);
    }

    // 移除被擠掉的圖片
    if (displacedImgId !== undefined) {
        nextMap = removeImage(nextMap, cellId);
    }

    // 若兩邊都有圖片且 cell 不相同 → 交換
    if (previousCellId !== undefined && displacedImgId !== undefined && previousCellId !== cellId) {
        nextMap = placeImage(nextMap, previousCellId, displacedImgId);
    }

    // 最後放置新圖片
    nextMap = placeImage(nextMap, cellId, imgId);

    return nextMap;
}
