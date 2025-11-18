<!-- src/features/Tactical/TacticalCell.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'

import { getWishImagePath } from '@/utils/imageRegistry'
import { DragTypes } from '@/constants/customMIMETypes'
import { useTeamTheme } from '@/composables/useTeamTheme';

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

const highlightColor = computed(() => {
  return useTeamTheme(props.teamSlot).themeVars.value['--team-color-rgb']
})


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
  
  <div 
  class="tactical__cell"
  :style="{'--highlight-color-rgb': highlightColor }"
  @dragover.prevent="isOver = true"
  @dragleave="isOver = false" 
  @dragstart="handleDragStartEvent" 
  @drop="handleDropEvent" 
  @click="handleClickEvent">
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
    transform 0.2s ease,;
  overflow: hidden;
  padding: var(--space-md) var(--space-sm);
  
}

.image__container {
  background-color: var(--md-sys-color-surface-container);
  border-radius: var(--radius-md);
  width: var(--size-tactical-cell);
  aspect-ratio: 16 / 9;
  object-fit: cover;
  z-index: 10;
  cursor: grab;
  overflow: hidden;
}

.image__container--active {
  outline: 2px solid rgba(var(--highlight-color-rgb));
}

.image__container:hover {
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
