<!-- src/features/CharacterSelector/CharacterSelector.vue -->
 
<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { CharacterInfo } from '@/types/CharacterInfo'
import { useSelectorOptions } from './composables/useSelectorOptions'
import { useCharacterFilter } from './composables/useCharacterFilter'

const props = defineProps<{
  characterMap: Record<string, CharacterInfo>
}>()

const emit = defineEmits<{
  (e: 'filter-changed', filters: Record<string, string>): void
  (e: 'pull', payload: { zoneType: 'utility' | 'ban' | 'pick' }): void
}>()

const selectorsData = useSelectorOptions(props.characterMap)
const { localFilters } = useCharacterFilter((filters) => emit('filter-changed', filters))

function handleClickUtilityButton() {
  console.log('Selector utility clicked')
  emit('pull', { zoneType: 'utility' })
}

function handleClickBanButton() {
  console.log('Selector ban clicked')
  emit('pull', { zoneType: 'ban' })
}

function handleClickPickButton() {
  console.log('Selector pick clicked')
  emit('pull', { zoneType: 'pick' })
}
</script>

<template>
  <div class="container__selector">
    <div class="selector__row" v-for="filter in selectorsData" :key="filter.key">
      <label class="selector__label">{{ filter.label }}：</label>
      <select
        class="selector__select selector__select--{{ filter.key }}"
        v-model="localFilters[filter.key]"
      >
        <option value="All">所有</option>
        <option v-for="item in filter.items" :key="item" :value="item">
          {{ filter.translateFn(item) }}
        </option>
      </select>
    </div>
    <div class="selector__toolbar">
      <button class="selector__button selector__button--utility" @click="handleClickUtilityButton">
        Utility
      </button>
      <button class="selector__button selector__button--ban" @click="handleClickBanButton">
        Ban
      </button>
      <button class="selector__button selector__button--pick" @click="handleClickPickButton">
        Pick
      </button>
    </div>
  </div>
</template>

<style scoped>
.container__selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  color: #4e4040;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  padding: 10px 10px;
  width: 100%;
  box-sizing: border-box;
  height: auto;
  gap: 12px;
  backdrop-filter: blur(4px);
}

.selector__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.container__selector label {
  font-size: 1.2em;
  font-weight: 500;
  white-space: nowrap;
}

.container__selector select {
  flex-grow: 1;
  font-size: 1.2em;
  padding: 5px 5px;
  border-radius: 6px;
  border: none;
  background-color: rgba(255, 255, 255, 0.9);
  color: #4e4040;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.container__selector select:hover {
  background-color: rgba(255, 255, 255, 0.9);
  transform: scale(1.02);
}

.container__selector select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(110, 110, 110, 0.4);
}

.selector__toolbar {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
}

.selector__button {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  z-index: 50;
  background-color: #4e4040;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  text-align: center;
  font-size: 1em;
  font-weight: bold;
}

.selector__button:hover {
  background-color: #6b5b5b;
  transform: scale(1.05);
}

.selector__button:active {
  transform: scale(0.98);
}
</style>
