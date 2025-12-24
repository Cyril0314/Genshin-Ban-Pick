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
    const displacedImgId = nextBoardImageMap[zoneId] ?? undefined;

    // 移除原本出現的位置
    if (previousZoneId !== undefined) {
        nextBoardImageMap = removeImage(nextBoardImageMap, previousZoneId);
    }

    const previousRandomContext = displacedImgId === undefined ? undefined : nextCharacterRandomContextMap[displacedImgId];

    // 移除被擠掉的圖片
    if (displacedImgId !== undefined) {
        nextBoardImageMap = removeImage(nextBoardImageMap, zoneId);
    }

    // 若兩邊都有圖片且 zone 不相同 → 交換
    if (previousZoneId !== undefined && displacedImgId !== undefined && previousZoneId !== zoneId) {
        nextBoardImageMap = placeImage(nextBoardImageMap, previousZoneId, displacedImgId);
    }

    // 最後放置新圖片
    nextBoardImageMap = placeImage(nextBoardImageMap, zoneId, imgId);

    if (randomContext) {
        nextCharacterRandomContextMap = addRandomContext(nextCharacterRandomContextMap, imgId, randomContext);
    }

    if (previousRandomContext && displacedImgId !== undefined && !findZoneIdByImageId(nextBoardImageMap, displacedImgId)) {
        nextCharacterRandomContextMap = removeRandomContext(nextCharacterRandomContextMap, displacedImgId);
    }

    return { boardImageMap: nextBoardImageMap, characterRandomContextMap: nextCharacterRandomContextMap };
}
