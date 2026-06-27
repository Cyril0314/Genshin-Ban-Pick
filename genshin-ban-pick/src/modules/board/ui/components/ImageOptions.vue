<!-- src/modules/board/ui/components/ImageOptions.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue';

import { createLogger } from '@/app/utils/logger';
import { getProfileImagePath } from '@/modules/shared/infrastructure/imageRegistry'
import { useCharacterHoverWrapper } from '@/modules/shared/ui/context/characterHoverWrapperContext';
import type { ICharacter } from '@shared/contracts/character/ICharacter';
import { DragTypes } from '@/app/constants/customMIMETypes';

const CharacterHoverWrapper = useCharacterHoverWrapper();

const logger = createLogger('board.ui.imageOptions');

const props = defineProps<{
  characterMap: Record<string, ICharacter>
  usedImageIds: string[]
  filteredCharacterKeys?: string[]
}>()

const availableCharacterKeys = computed(() =>
  Object.entries(props.characterMap)
    .filter(([id]) => !props.usedImageIds.includes(id))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id]) => id)
)

const filteredSet = computed(() => new Set(props.filteredCharacterKeys ?? []))

const isFiltered = (id: string) => filteredSet.value.has(id)

const isDragging = ref(false);

function handleDragStartEvent(id: string, event: DragEvent) {
    logger.debug('drag start', id);
    isDragging.value = true;
    event?.dataTransfer?.setData(DragTypes.CHARACTER_IMAGE, id);
}

function handleDragEndEvent() {
    isDragging.value = false;
}

</script>

<template>
  <div class="image-options">
    <component :is="CharacterHoverWrapper" v-for="id in availableCharacterKeys" :key="id" :character-key="id" :disabled="isDragging">
        <img class="option" :class="{ 'is-dimmed': !isFiltered(id) }" :id="id" :src="getProfileImagePath(id)"
            draggable="true" @dragstart="handleDragStartEvent(id, $event)" @dragend="handleDragEndEvent" />
    </component>
  </div>
</template>

<style scoped>
.image-options {
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

.option {
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: var(--space-sm);
  cursor: grab;
  border-radius: var(--radius-sm);
  transition:
    filter 0.18s ease,
    transform 0.18s ease,;
  /* filter: saturate(0.8) brightness(0.9); */
}

.option.is-dimmed {
  opacity: 0.3;
  filter: grayscale(100%) brightness(0.6);
  /* background-color: var(--md-sys-color-neutral-disabled); */
}

.option:not(.is-dimmed):hover {
  background-color: var(--md-sys-color-state-hover);
  transform: scale(1.05);
  filter: initial;
}

.option:not(.is-dimmed):focus {
  background-color: var(--md-sys-color-state-focus);
  filter: none;
}

</style>
