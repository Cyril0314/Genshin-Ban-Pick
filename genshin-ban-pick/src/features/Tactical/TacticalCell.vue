<!-- src/features/Tactical/TacticalCell.vue -->
<script setup lang="ts">
import { ref } from 'vue'

import { getProfileImagePath } from '@/utils/imageRegistry'
import { DragTypes } from '@/constants/customMIMETypes'

const props = defineProps<{
  zoneId: string
  imageId?: string
}>()

const emit = defineEmits<{
  (e: 'drop', payload: { zoneId: string; imgId: string }): void
  (e: 'clear', payload: { zoneId: string }): void
}>()

const isOver = ref(false)

function handleDragStartEvent(event: DragEvent) {
  if (props.imageId && event.dataTransfer) {
    console.log(`onDragStart ${props.imageId}`)
    event?.dataTransfer?.setData(DragTypes.CharacterImage, props.imageId)
  }  
}

function handleDropEvent(event: DragEvent) {
  event.preventDefault()
  isOver.value = false
  const imgId = event.dataTransfer?.getData(DragTypes.CharacterImage)
  if (!imgId || props.imageId) return
  emit('drop', { zoneId: props.zoneId, imgId })
}

function handleClickEvent() {
  if (props.imageId) emit('clear', { zoneId: props.zoneId })
}
</script>

<template>
  <div
    class="tactical__cell"
    :class="{ 'tactical__cell--active': isOver }"
    @dragover.prevent="isOver = true"
    @dragleave="isOver = false"
    @dragstart="handleDragStartEvent"
    @drop="handleDropEvent"
    @click="handleClickEvent"
  >
    <img v-if="imageId" :src="getProfileImagePath(imageId)" />
  </div>
</template>

<style scoped>
.tactical__cell {
  background: var(--md-sys-color-surface-container-highest-alpha);
  border-radius: var(--border-radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tactical__cell--active {
  outline: calc(var(--space-xs) / 2) solid var(--md-sys-color-secondary-container);
}

.tactical__cell:hover {
  transform: scale(1.03);
  box-shadow: var(--box-shadow-hover);
}

.tactical__cell img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: contain;
    cursor: grab;
    z-index: 10;
}
</style>
