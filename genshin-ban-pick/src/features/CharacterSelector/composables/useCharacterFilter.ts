// src/features/CharacterSelector/composables/useCharacterFilter.ts

import { reactive, watch } from 'vue'
import type { FilterKey } from './useSelectorOptions'

export function useCharacterFilter(emit: (filters: Record<FilterKey, string>) => void) {
  const localFilters = reactive<Record<FilterKey, string>>({
    weapon: 'All',
    element: 'All',
    region: 'All',
    rarity: 'All',
    model_type: 'All',
    role: 'All',
    wish: 'All',
  })

  watch(localFilters, () => emit({ ...localFilters }), { deep: true })

  return { localFilters }
}
