// backend/src/modules/board/domain/imageRestore.ts

import { removeImage } from './removeImage';
import { removeRandomContext } from './removeRandomContext';

import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';
import type { CharacterRandomContextMap } from '@shared/contracts/character/CharacterRandomContextMap';

export function imageRestore(boardImageMap: BoardImageMap, characterRandomContextMap: CharacterRandomContextMap, zoneId: number) {
    let nextBoardImageMap = { ...boardImageMap };
    let nextCharacterRandomContextMap = { ...characterRandomContextMap };
    const imgId = nextBoardImageMap[zoneId];
    nextBoardImageMap = removeImage(nextBoardImageMap, zoneId)
    nextCharacterRandomContextMap = removeRandomContext(nextCharacterRandomContextMap, imgId)
    return { boardImageMap: nextBoardImageMap, characterRandomContextMap: nextCharacterRandomContextMap };
}