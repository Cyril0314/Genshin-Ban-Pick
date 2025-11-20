<!-- src/modules/board/ui/components/ImageOptions.vue -->
<script setup lang="ts">
import { computed } from 'vue'

import type { ICharacter } from '@/modules/character/types/ICharacter'

import { getProfileImagePath } from '@/utils/imageRegistry'
import { DragTypes } from '@/constants/customMIMETypes'

const props = defineProps<{
  characterMap: Record<string, ICharacter>
  usedImageIds: string[]
  filteredCharacterKeys: string[] | null
}>()

const availableCharacterKeys = computed(() =>
  Object.entries(props.characterMap)
    .filter(([id]) => !props.usedImageIds.includes(id))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id]) => id)
)

const isFilitered = (id: string) => props.filteredCharacterKeys?.includes(id) ?? true

function handleDragStartEvent(event: DragEvent, id: string) {
  console.debug(`[IMAGE OPTIONS] Handle drag start event`, id)
  event?.dataTransfer?.setData(DragTypes.CHARACTER_IMAGE, id)
}
</script>

<template>
  <div class="container__images">
    <img v-for="id in availableCharacterKeys" :class="{ dimmed: !isFilitered(id) }" :key="id" :id="id"
      :src="getProfileImagePath(id)" draggable="true" @dragstart="handleDragStartEvent($event, id)" />
  </div>
</template>

<style scoped>
.container__images {
  --size-image: calc(var(--base-size) * 4.0);
  --min-row: 2;
  --max-row: 5;
  --gap: var(--space-sm);
  display: grid;
  padding: var(--gap);
  gap: var(--gap);
  grid-template-columns: repeat(auto-fit, var(--size-image));
  min-height: calc(var(--size-image) * var(--min-row) + var(--gap) * (var(--min-row) + 1));
  max-height: calc(var(--size-image) * var(--max-row) + var(--gap) * (var(--max-row) + 1));
  width: 100%;
  align-content: start;
  justify-content: center;
  border-radius: var(--radius-lg);
  background-color: var(--md-sys-color-surface-container);
  overflow-y: auto;
  scrollbar-width: none;
}

.container__images img {
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: var(--space-sm);
  cursor: grab;
  border-radius: var(--radius-sm);
  transition: 
    filter 0.18s ease,
    transform 0.18s ease,;
  filter: saturate(0.8) brightness(0.9);
}

.container__images img.dimmed {
  opacity: 0.3;
  filter: grayscale(100%) brightness(0.6);
  /* background-color: var(--md-sys-color-neutral-disabled); */
}

.container__images img:not(.dimmed):hover {
  background-color: var(--md-sys-color-state-hover);
  transform: scale(1.05);
  filter: initial;
}

.container__images img:not(.dimmed):focus {
  background-color: var(--md-sys-color-state-focus);
  filter: none;
}

</style>
