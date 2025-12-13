// backend/src/modules/board/domain/imageDrop.ts

import { placeImage } from './placeImage';
import { removeImage } from './removeImage';
import { findZoneIdByImageId } from './findZoneIdByImageId';
import { addRandomContext } from './addRandomContext';
import { removeRandomContext } from './removeRandomContext';
import { createLogger } from '../../../utils/logger';

import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';
import type { ICharacterRandomContext } from '@shared/contracts/character/ICharacterRandomContext';
import type { CharacterRandomContextMap } from '@shared/contracts/character/CharacterRandomContextMap';

export function imageDrop(
    boardImageMap: BoardImageMap,
    characterRandomContextMap: CharacterRandomContextMap,
    zoneId: number,
    imgId: string,
    randomContext?: ICharacterRandomContext,
) {
    let nextBoardImageMap = { ...boardImageMap };
    let nextCharacterRandomContextMap = { ...characterRandomContextMap };

    const previousZoneId = findZoneIdByImageId(nextBoardImageMap, imgId);
    const displacedImgId = nextBoardImageMap[zoneId] ?? null;

    // 移除原本出現的位置
    if (previousZoneId !== null) {
        nextBoardImageMap = removeImage(nextBoardImageMap, previousZoneId);
    }

    const previousRandomContext = displacedImgId === null ? null : nextCharacterRandomContextMap[displacedImgId];

    // 移除被擠掉的圖片
    if (displacedImgId !== null) {
        nextBoardImageMap = removeImage(nextBoardImageMap, zoneId);
    }

    // 若兩邊都有圖片且 zone 不相同 → 交換
    if (previousZoneId !== null && displacedImgId !== null && previousZoneId !== zoneId) {
        nextBoardImageMap = placeImage(nextBoardImageMap, previousZoneId, displacedImgId);
    }

    // 最後放置新圖片
    nextBoardImageMap = placeImage(nextBoardImageMap, zoneId, imgId);

    if (randomContext) {
        nextCharacterRandomContextMap = addRandomContext(nextCharacterRandomContextMap, imgId, randomContext);
    }

    if (previousRandomContext && displacedImgId !== null && !findZoneIdByImageId(nextBoardImageMap, displacedImgId)) {
        nextCharacterRandomContextMap = removeRandomContext(nextCharacterRandomContextMap, displacedImgId);
    }

    return { boardImageMap: nextBoardImageMap, characterRandomContextMap: nextCharacterRandomContextMap };
}
