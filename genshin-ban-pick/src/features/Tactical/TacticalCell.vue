<!-- src/features/Tactical/TacticalCell.vue -->
<script setup lang="ts">
import { ref } from 'vue'

import { getWishImagePath } from '@/utils/imageRegistry'
import { DragTypes } from '@/constants/customMIMETypes'

const props = defineProps<{
  cellId: number
  imageId?: string
}>()

const emit = defineEmits<{
  (e: 'image-drop', payload: { cellId: number, imgId: string }): void
  (e: 'image-restore', payload: { cellId: number }): void
}>()

const isOver = ref(false)

function handleDragStartEvent(event: DragEvent) {
  console.debug(`[TATICAL CELL] Handle drag start event`);
  if (props.imageId && event.dataTransfer) {
    event?.dataTransfer?.setData(DragTypes.CHARACTER_IMAGE, props.imageId)
  }
}

function handleDropEvent(event: DragEvent) {
  console.debug(`[TATICAL CELL] Handle drop event`);
  event.preventDefault()
  isOver.value = false
  const imgId = event.dataTransfer?.getData(DragTypes.CHARACTER_IMAGE)
  if (!imgId) return
  emit('image-drop', { cellId: props.cellId, imgId })
}

function handleClickEvent() {
  console.debug(`[TATICAL CELL] Handle click event`, props.cellId);
  if (props.imageId) emit('image-restore', { cellId: props.cellId })
}
</script>

<template>
  
  <div class="tactical__cell"  @dragover.prevent="isOver = true"
    @dragleave="isOver = false" @dragstart="handleDragStartEvent" @drop="handleDropEvent" @click="handleClickEvent">
      <div class="image__container" :class="{ 'image__container--active': isOver }">
      <template v-if="imageId">
        <img class="image" :src="getWishImagePath(imageId)" />
      </template>
      </div>
  </div>
</template>

<style scoped>
.tactical__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  overflow: hidden;
  padding: var(--space-lg) var(--space-sm);
  
}

.image__container {
  background: var(--md-sys-color-surface-container-highest-alpha);
  border-radius: var(--border-radius-xs);
  width: var(--size-tactical-cell);
  aspect-ratio: 16 / 9;
  object-fit: cover;
  z-index: 10;
  cursor: grab;
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.image__container--active {
  outline: calc(var(--space-xs) / 2) solid var(--md-sys-color-secondary-container);
}

.image__container:hover {
  transform: scale(1.03);
  box-shadow: var(--box-shadow-hover);
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 10;
  cursor: grab;
}

</style>
