// backend/src/modules/board/domain/imageMapReset.ts

import type { BoardImageMap } from "@shared/contracts/board/BoardImageMap";
import type { CharacterRandomContextMap } from "@shared/contracts/character/CharacterRandomContextMap";

export function imageMapReset(boardImageMap: BoardImageMap, characterRandomContextMap: CharacterRandomContextMap) {
    let nextBoardImageMap = { ...boardImageMap };
    let nextCharacterRandomContextMap = { ...characterRandomContextMap };
    nextBoardImageMap = {}
    nextCharacterRandomContextMap = {}
    return { boardImageMap: nextBoardImageMap, characterRandomContextMap: nextCharacterRandomContextMap };
}