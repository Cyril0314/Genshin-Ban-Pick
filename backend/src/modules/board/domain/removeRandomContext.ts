// backend/src/modules/board/domain/removeRandomContext.ts

import type { CharacterRandomContextMap } from "@shared/contracts/character/CharacterRandomContextMap";

export function removeRandomContext(
    characterRandomContextMap: CharacterRandomContextMap,
    imgId: string,
): CharacterRandomContextMap {
    const newMap = { ...characterRandomContextMap };
    delete newMap[imgId];
    return newMap;
}