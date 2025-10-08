<!-- src/features/ImageOptions/ImageOptions.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { Character } from '@/types/Character'
import { getProfileImagePath } from '@/utils/imageRegistry'

const props = defineProps<{
  characterMap: Record<string, Character>
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
  --gap: var(--space-sm);
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--size-image));
  height: calc(var(--size-image) * 2.25 + var(--gap) * 2);
  max-height: calc(var(--size-image) * 2.25 + var(--gap) * 2);
  /* width: calc(var(--size-dropzone) * 12 + var(--gap) * 11); */
  width: 100%;
  padding: var(--gap);
  align-content: start;
  justify-content: start;
  overflow-y: auto;
  gap: var(--gap);
  border-radius: var(--border-radius-xs);
  background: var(--md-sys-color-surface-container-highest-alpha);
}

.image-options img {
  width: 100%;
  aspect-ratio: 1 / 1;
  cursor: grab;
}

.image-options img.dimmed {
  opacity: 0.3;
  filter: grayscale(100%);
}
</style>
