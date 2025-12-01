// src/modules/character/ui/components/composables/useFilteredCharacters.ts
import { computed } from 'vue'

import type { CharacterFilterKey } from '@shared/contracts/character/value-types';
import type { ICharacter } from '@shared/contracts/character/ICharacter.ts';

export function useFilteredCharacters(
  characterMap: Record<string, ICharacter>,
  characterFilter:Record<CharacterFilterKey, string[]>,
) {
  return computed(() => {
    const result = Object.entries(characterMap).filter(([id, char]) => {
      return Object.entries(characterFilter).every(([key, selected]) => {
        if (!Array.isArray(selected) || selected.length === 0) return true
        return selected.includes(char[key as CharacterFilterKey] as string)
      })
    })
    .map(([id]) => id)
    return result
  })
}
