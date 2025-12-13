// backend/src/modules/board/domain/addRandomContext.ts

import type { CharacterRandomContextMap } from "@shared/contracts/character/CharacterRandomContextMap";
import type { ICharacterRandomContext } from "@shared/contracts/character/ICharacterRandomContext";

export function addRandomContext(
    characterRandomContextMap: CharacterRandomContextMap,
    imgId: string,
    characterRandomContext: ICharacterRandomContext
): CharacterRandomContextMap {
    return {
        ...characterRandomContextMap,
        [imgId]: characterRandomContext,
    };
}