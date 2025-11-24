// src/modules/banPick/ui/composables/useViewportScale.vue

import type { Ref } from 'vue';
import type { CharacterFilterKey } from '@/modules/character';

export function useBanPickFilters(filteredCharacterKeys: Ref<string[]>, characterFilter: Ref<Record<CharacterFilterKey, string[]>>) {
    function filterChange({
        filteredCharacterKeys: newKeys,
        characterFilter: newFilter,
    }: {
        filteredCharacterKeys: string[];
        characterFilter: Record<CharacterFilterKey, string[]>;
    }) {
        console.debug(`[BAN PICK FILITERS] Handle filiter changed:`, { filteredCharacterKeys: newKeys, characterFilter: newFilter });
        filteredCharacterKeys.value = newKeys;
        characterFilter.value = newFilter;
    }

    return { filterChange };
}
