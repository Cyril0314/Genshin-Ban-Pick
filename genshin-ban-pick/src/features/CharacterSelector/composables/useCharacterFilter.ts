// src/features/CharacterSelector/composables/useCharacterFilter.ts

import { reactive, watch } from 'vue'
import type { FilterKey } from './useSelectorOptions'

export function useCharacterFilter(emit: (filters: Record<FilterKey, string[]>) => void) {
  const localFilters = reactive<Record<FilterKey, string[]>>({
    weapon: [],
    element: [],
    region: [],
    rarity: [],
    model_type: [],
    role: [],
    wish: [],
  })

  watch(localFilters, () => emit({ ...localFilters }), { deep: true })

  return { localFilters }
}
