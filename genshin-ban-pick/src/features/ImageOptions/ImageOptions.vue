<!-- src/features/ImageOptions/ImageOptions.vue -->
<script setup lang="ts">
import { computed } from 'vue'

import type { ICharacter } from '@/types/ICharacter'

import { getProfileImagePath } from '@/utils/imageRegistry'
import { DragTypes } from '@/constants/customMIMETypes'

const props = defineProps<{
  characterMap: Record<string, ICharacter>
  usedImageIds: string[]
  filteredCharacterIds: string[] | null
}>()

const availableCharacterIds = computed(() =>
  Object.entries(props.characterMap)
    .filter(([id]) => !props.usedImageIds.includes(id))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id]) => id)
)

const isFilitered = (id: string) => props.filteredCharacterIds?.includes(id) ?? true

function handleDragStartEvent(event: DragEvent, id: string) {
  console.debug(`[IMAGE OPTIONS] Handle drag start event`, id)
  event?.dataTransfer?.setData(DragTypes.CHARACTER_IMAGE, id)
}
</script>

<template>
  <div class="container__images">
    <img v-for="id in availableCharacterIds" :class="{ dimmed: !isFilitered(id) }" :key="id" :id="id"
      :src="getProfileImagePath(id)" draggable="true" @dragstart="handleDragStartEvent($event, id)" />
  </div>
</template>

<style scoped>
.container__images {
  --size-image: calc(var(--base-size) * 3.60);
  --min-row: 2;
  --max-row: 5;
  --gap: var(--space-md);
  display: grid;
  padding: var(--gap);
  gap: var(--gap);
  grid-template-columns: repeat(auto-fit, var(--size-image));
  min-height: calc(var(--size-image) * var(--min-row) + var(--gap) * (var(--min-row) + 1));
  max-height: calc(var(--size-image) * var(--max-row) + var(--gap) * (var(--max-row) + 1));
  width: 100%;
  align-content: start;
  justify-content: center;
  border-radius: var(--border-radius-xs);
  background: var(--md-sys-color-surface-container-highest-alpha);
  overflow-y: auto;
  scrollbar-width: none;
}

.container__images img {
  width: 100%;
  aspect-ratio: 1 / 1;
  cursor: grab;
}

.container__images img.dimmed {
  opacity: 0.3;
  filter: grayscale(100%);
}
</style>
