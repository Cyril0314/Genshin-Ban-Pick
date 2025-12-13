// src/modules/shared/ui/composables/useCharacterDisplayName.ts

import { characterNameMap } from "../../constants/characterNameMap";

export function useCharacterDisplayName() {
    function getByKey(key: string) {
        return characterNameMap[key] ?? key;
    }

    return {
        getByKey
    }
}
