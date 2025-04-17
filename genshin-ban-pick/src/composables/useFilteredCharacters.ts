// src/composables/useFilteredCharacters.ts
import { computed, unref } from 'vue'
import type { Ref } from 'vue'
import type { CharacterInfo } from '@/types/CharacterInfo'

type FilterKey = keyof CharacterInfo

export function useFilteredCharacters(
    characterMap: Ref<Record<string, CharacterInfo>> | Record<string, CharacterInfo>,
    filters: Ref<Record<string, string>> | Record<string, string>,
) {
  return computed(() => {
    const map = unref(characterMap)
    const filterValues = unref(filters)

    const result = Object.entries(map)
      .filter(([id, char]) => {
        return Object.entries(filterValues).every(([key, value]) => {
          return value === 'All' || char[key as FilterKey] === value
        })
      })
      .map(([id]) => id)
    return result
  })
}
