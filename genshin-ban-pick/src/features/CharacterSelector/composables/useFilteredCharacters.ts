// src/composables/useFilteredCharacters.ts
import { computed } from 'vue'

import type { ICharacter } from '@/types/ICharacter'
import type { CharacterFilterKey } from '@/types/CharacterFilterKey'

type FilterKey = keyof ICharacter

export function useFilteredCharacters(
  characterMap: Record<string, ICharacter>,
  characterFilter:Record<CharacterFilterKey, string[]>,
) {
  return computed(() => {
    const result = Object.entries(characterMap).filter(([id, char]) => {
      return Object.entries(characterFilter).every(([key, selected]) => {
        if (!Array.isArray(selected) || selected.length === 0) return true
        return selected.includes(char[key as FilterKey])
      })
    })
    .map(([id]) => id)
    return result
  })
}
