<!-- src/features/ImageOptions/ImageOptions.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { CharacterInfo } from '@/types/CharacterInfo'
import { getProfileImagePath } from '@/utils/imageRegistry'

const props = defineProps<{
  characterMap: Record<string, CharacterInfo>
  usedIds: string[]
  filteredIds: string[]
}>()

const availableCharacters = computed(() =>
  Object.entries(props.characterMap)
    .filter(([id]) => !props.usedIds.includes(id))
    .sort(([a], [b]) => a.localeCompare(b)),
)

const isFilitered = (id: string) => props.filteredIds.includes(id)

function handleDragStartEvent(event: DragEvent, id: string) {
  console.log(`onDragStart ${id}`)
  event?.dataTransfer?.setData('text/plain', id)
}
</script>

<template>
  <div class="image-options">
    <img
      v-for="[id, char] in availableCharacters"
      :key="id"
      :id="id"
      :src="getProfileImagePath(id)"
      :class="{ dimmed: !isFilitered(id) }"
      draggable="true"
      @dragstart="handleDragStartEvent($event, id)"
    />
  </div>
</template>

<style scoped>
.image-options {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 190px;
  overflow-y: auto;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.1);
}

.image-options img {
  width: 90px;
  height: auto;
  cursor: grab;
}

.image-options img.dimmed {
  opacity: 0.3;
  filter: grayscale(100%);
}
</style>
