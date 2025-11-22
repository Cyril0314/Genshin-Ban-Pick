// src/modules/shared/domain/getCharacterDisplayName.ts

import { characterNameMap } from "../constants/characterNameMap";

export function getCharacterDisplayName(key: string) {
    return characterNameMap[key] ?? key;
}
