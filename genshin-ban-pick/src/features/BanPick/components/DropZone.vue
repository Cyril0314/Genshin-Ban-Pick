<!-- src/features/BanPick/components/DropZone.vue -->
<script setup lang="ts">

import { ref, computed } from 'vue'

import { useBanPickStepStore } from '@/stores/banPickStepStore';
import { getWishImagePath } from '@/utils/imageRegistry'
import { DragTypes } from '@/constants/customMIMETypes'

import type { IZone } from '@/types/IZone';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  zone: IZone
  boardImageMap: Record<number, string>
  label?: string
  labelColor?: string
}>()

const emit = defineEmits<{
  (e: 'image-drop', payload: { imgId: string; zoneId: number }): void
  (e: 'image-restore', payload: { zoneId: number }): void
}>()

const isOver = ref(false)

const imageId = computed(() => props.boardImageMap[props.zone.id] ?? '')

const banPickStepStore = useBanPickStepStore()
const { currentStep } = storeToRefs(banPickStepStore)

function handleDragStartEvent(event: DragEvent) {
  console.debug(`[DROP ZONE] Handle drag start event`);
  if (imageId.value && event.dataTransfer) {
    event?.dataTransfer?.setData(DragTypes.CHARACTER_IMAGE, imageId.value)
  }
}

function handleDropEvent(event: DragEvent) {
  console.debug(`[DROP ZONE] Handle drop event`);
  event.preventDefault()
  isOver.value = false
  const imgId = event.dataTransfer?.getData(DragTypes.CHARACTER_IMAGE)
  if (imgId) {
    emit('image-drop', { imgId, zoneId: props.zone.id })
  }
}

function handleClickEvent(event: MouseEvent) {
  console.debug(`[DROP ZONE] Handle click event`, props.zone);
  const target = event.target as HTMLElement
  if (target.tagName === 'IMG' && imageId) {
    emit('image-restore', { zoneId: props.zone.id })
  }
}

const isHighlighted = computed(() => props.zone.id === currentStep.value?.zoneId)
</script>

<template>
  <div class="drop-zone" :class="[
    'drop-zone--' + (props.zone.type || 'default'),
    { 'drop-zone--active': isOver, highlight: isHighlighted },
  ]" @dragover.prevent="isOver = true" @dragleave="isOver = false" @dragstart="handleDragStartEvent"
    @drop="handleDropEvent" @click="handleClickEvent">
    <template v-if="imageId">
      <img class="drop-zone__background" :src="getWishImagePath(imageId)" aria-hidden="true" />
      <img class="drop-zone__image" :src="getWishImagePath(imageId)" />
    </template>
    <span v-else class="drop-zone__label" :style="{ color: props.labelColor || '#888' }">{{
      label
    }}</span>
  </div>
</template>

<style scoped>
.drop-zone {
  position: relative;
  width: var(--size-dropzone);
  aspect-ratio: 16 / 9;
  background-color: var(--md-sys-color-surface-container-high-alpha);
  border-radius: var(--border-radius-xs);
  box-shadow: var(--box-shadow);
  display: flex;
  justify-content: center;
  align-items: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  backdrop-filter: var(--backdrop-filter);
  overflow: hidden;
}

.drop-zone__background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(2);
  filter: blur(4px) brightness(0.8);
  opacity: 0.5;
  z-index: 1;
  animation: subtleMove 4s ease-in-out infinite alternate;
}


@keyframes subtleMove {
  0% {
    transform: scale(2);
  }

  50% {
    transform: scale(3);
  }

  100% {
    transform: scale(2);
  }
}

.drop-zone__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 10;
}

.drop-zone--active,
.drop-zone.highlight.drop-zone--active {
  outline: calc(var(--space-xs) / 2) solid var(--md-sys-color-secondary-container);
}

.drop-zone:hover {
  transform: scale(1.05);
  box-shadow: var(--box-shadow-hover);
}

.drop-zone.highlight {
  outline: var(--space-xs) var(--md-sys-color-secondary-container);
  background-color: var(--md-sys-color-surface-container-highest-alpha);
  box-shadow:
    0 0 var(--space-xs) var(--md-sys-color-tertiary-container),
    0 0 var(--space-sm) var(--md-sys-color-secondary-container);
  animation: highlightGlow 1.2s ease-in-out infinite;
  transform: scale(1.05);
}

@keyframes highlightGlow {
  0% {
    box-shadow: 0 0 var(--space-lg) var(--md-sys-color-tertiary-container);
  }

  50% {
    box-shadow: 0 0 var(--space-sm) var(--md-sys-color-secondary-container);
  }

  100% {
    box-shadow: 0 0 var(--space-lg) var(--md-sys-color-tertiary-container);
  }
}

.drop-zone__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  font-family: var(--font-family-tech-ui);
  text-align: center;
  pointer-events: none;
  user-select: none;
  z-index: 10;
}
</style>
