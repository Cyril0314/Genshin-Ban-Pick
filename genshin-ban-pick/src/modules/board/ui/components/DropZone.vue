<!-- src/modules/board/ui/components/DropZone.vue -->

<script setup lang="ts">

import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia';

import { DragTypes } from '@/app/constants/customMIMETypes'
import { getWishImagePath } from '@/modules/shared/infrastructure/imageRegistry'
import { useTeamTheme } from '@/modules/shared/ui/composables/useTeamTheme';
import { useMatchStepStore } from '../../store/matchStepStore';

import type { IZone } from "../../types/IZone";

const props = defineProps<{
  zone: IZone
  boardImageMap: Record<number, string>
  label?: string
}>()

const emit = defineEmits<{
  (e: 'image-drop', payload: { zoneId: number; imgId: string }): void
  (e: 'image-restore', payload: { zoneId: number }): void
}>()

const isOver = ref(false)

const imageId = computed(() => props.boardImageMap[props.zone.id] ?? '')

const matchStepStore = useMatchStepStore()
const { currentStep } = storeToRefs(matchStepStore)

const teamTheme = computed(() => {
  const slot = currentStep.value?.teamSlot ?? null;
  return slot === null ? null : useTeamTheme(slot);
});

const highlightColor = computed(() => {
  if (!teamTheme.value) return `var(--md-sys-color-on-surface-rgb)`;
  return teamTheme.value.themeVars.value['--team-color-rgb'];
});

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
    emit('image-drop', { zoneId: props.zone.id, imgId })
  }
}

function handleClickEvent(event: MouseEvent) {
  console.debug(`[DROP ZONE] Handle click event`, props.zone);
  if (imageId.value) {
    emit('image-restore', { zoneId: props.zone.id });
  }
}

const isHighlighted = computed(() => props.zone.id === currentStep.value?.zoneId)
</script>

<template>
  <div 
    class="drop-zone" 
    :class="['drop-zone--' + (props.zone.type || 'default'), { 'drop-zone--active': isOver, highlight: isHighlighted },]"
    :style="{'--highlight-color-rgb': highlightColor }"
    @dragover.prevent="isOver = true" 
    @dragleave="isOver = false" 
    @dragstart="handleDragStartEvent"
    @drop="handleDropEvent" 
    @click="handleClickEvent">
    <template v-if="imageId">
      <img class="drop-zone__background" :src="getWishImagePath(imageId)" aria-hidden="true" />
      <img class="drop-zone__image" :src="getWishImagePath(imageId)" />
    </template>
    <span v-else class="drop-zone__label">{{
      label
    }}</span>
  </div>
</template>

<style scoped>
.drop-zone {
  position: relative;
  width: var(--size-drop-zone-width);
  aspect-ratio: 16 / 9;
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface);
  border-radius: var(--radius-md);
  display: flex;
  justify-content: center;
  align-items: center;
  transition:
    transform 0.2s ease;
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
  transition: 
    filter 0.18s ease,
    transform 0.18s ease,;
  filter: saturate(0.95) brightness(0.95);
}

.drop-zone__background {
  pointer-events: none;
}

.drop-zone__image {
  pointer-events: auto; /* 允許拖曳 */
}

.drop-zone--active,
.drop-zone.highlight.drop-zone--active {
  outline: 2px solid rgba(var(--highlight-color-rgb) / 0.55);
}

.drop-zone:hover {
  background-color: var(--md-sys-color-surface-container);
  transform: scale(1.03); 
  filter: initial;
}

.drop-zone:focus {
  background-color: var(--md-sys-color-surface-container-higher);
  filter: none;
}


.drop-zone.highlight {
  box-shadow:
    0 0 8px rgba(var(--highlight-color-rgb) / 0.8),
    0 0 16px rgba(var(--highlight-color-rgb) / 0.32),
    0 0 32px rgba(var(--highlight-color-rgb) / 0.16);

  outline: 2px solid rgba(var(--highlight-color-rgb) / 0.55);
  transform: scale(1.06);
  animation: zonePulse 1.6s ease-in-out infinite;
}

@keyframes zonePulse {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.35);
  }
  100% {
    filter: brightness(1);
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
