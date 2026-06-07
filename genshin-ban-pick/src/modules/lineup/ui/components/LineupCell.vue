<!-- src/modules/lineup/ui/components/LineupCell.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue';

import { createLogger } from '@/app/utils/logger';
import { DragTypes } from '@/app/constants/customMIMETypes'
import { getTeamTheme } from '@/modules/shared/ui/composables/getTeamTheme';
import { getWishImagePath } from '@/modules/shared/infrastructure/imageRegistry'

const props = defineProps<{
  cellId: number
  imageId?: string
  teamSlot: number
}>()

const emit = defineEmits<{
  (e: 'image-drop', payload: { cellId: number, imgId: string }): void
  (e: 'image-restore', payload: { cellId: number }): void
}>()

const isOver = ref(false)

const logger = createLogger('lineup.ui.cell');
const highlightColor = computed(() => {
  return getTeamTheme(props.teamSlot).themeVars['--team-color-rgb']
})


function handleDragStartEvent(event: DragEvent) {
  logger.debug('drag start');
  if (props.imageId && event.dataTransfer) {
    event?.dataTransfer?.setData(DragTypes.CHARACTER_IMAGE, props.imageId)
  }
}

function handleDropEvent(event: DragEvent) {
  logger.debug('drop');
  event.preventDefault()
  isOver.value = false
  const imgId = event.dataTransfer?.getData(DragTypes.CHARACTER_IMAGE)
  if (!imgId) return
  emit('image-drop', { cellId: props.cellId, imgId })
}

function handleClickEvent() {
  logger.debug('click', props.cellId);
  if (props.imageId) emit('image-restore', { cellId: props.cellId })
}
</script>

<template>

  <div
  class="lineup-cell"
  :style="{'--highlight-color-rgb': highlightColor }"
  @dragover.prevent="isOver = true"
  @dragleave="isOver = false"
  @dragstart="handleDragStartEvent"
  @drop="handleDropEvent"
  @click="handleClickEvent">
      <div class="image-container" :class="{ 'is-active': isOver, 'is-empty': !imageId }">
          <img v-if="imageId" class="image" :src="getWishImagePath(imageId)" />
      </div>
  </div>
</template>

<style scoped>
.lineup-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  position: relative;
  border-radius: var(--radius-sm);
  width: var(--size-lineup-cell);
  aspect-ratio: 16 / 9;
  z-index: 10;
  overflow: hidden;
  background-color: var(--md-sys-color-surface-container);
  cursor: grab;
  transition: transform 0.2s ease;
}

.image-container.is-empty {
  background-color: var(--md-sys-color-surface-container-low);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.35),
    inset 0 1px 8px rgba(0, 0, 0, 0.2);
  cursor: default;
}

.image-container.is-active {
  outline: 2px solid rgba(var(--highlight-color-rgb));
}

.image-container:not(.is-empty):hover {
  transform: scale(1.05);
}


.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 10;
  cursor: grab;
}

</style>
