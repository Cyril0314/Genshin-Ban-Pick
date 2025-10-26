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
  --gap: var(--space-sm);
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--size-image));
  height: calc(var(--size-image) * 2.25 + var(--gap) * 2);
  /* 維持最小高度 */
  max-height: calc(var(--size-image) * 2.25 + var(--gap) * 2);
  /* 維持最大高度 */
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
