// src/composables/useFilteredCharacters.ts
import { computed, unref } from 'vue'
import type { Ref } from 'vue'
import type { Character } from '@/types/Character'

type FilterKey = keyof Character

export function useFilteredCharacters(
  characterMap: Ref<Record<string, Character>> | Record<string, Character>,
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
