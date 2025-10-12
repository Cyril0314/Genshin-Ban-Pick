// src/composables/useFilteredCharacters.ts
import { computed, unref } from 'vue'

import type { ICharacter } from '@/types/ICharacter'
import type { Ref } from 'vue'

type FilterKey = keyof ICharacter

export function useFilteredCharacters(
  characterMap: Ref<Record<string, ICharacter>> | Record<string, ICharacter>,
  filters: Ref<Record<string, string[]>> | Record<string, string[]>,
) {
  return computed(() => {
    const map = unref(characterMap)
    const filterValues = unref(filters)

    const result = Object.entries(map).filter(([id, char]) => {
      return Object.entries(filterValues).every(([key, selected]) => {
        if (!Array.isArray(selected) || selected.length === 0) return true
        return selected.includes(char[key as FilterKey])
      })
    })
    .map(([id]) => id)
    return result
  })
}
