// src/modules/banPick/ui/composables/useViewportScale.vue

import type { Ref } from 'vue';
import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';

export function useBanPickFilters(filteredCharacterKeys: Ref<string[]>, characterFilter: Ref<Record<CharacterFilterKey, string[]>>) {
    function filterChange({
        filteredCharacterKeys: newKeys,
        characterFilter: newFilter,
    }: {
        filteredCharacterKeys: string[];
        characterFilter: Record<CharacterFilterKey, string[]>;
    }) {
        filteredCharacterKeys.value = newKeys;
        characterFilter.value = newFilter;
    }

    return { filterChange };
}
