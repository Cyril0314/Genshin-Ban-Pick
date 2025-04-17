<!-- src/features/BanPick/components/DropZone.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { getWishImagePath } from '@/utils/imageRegistry'
import { useBanPickStep } from '@/features/BanPick/composables/useBanPickStep'

const props = defineProps<{
  zoneId: string
  imageMap: Record<string, string>
  label?: string
  type?: 'pick' | 'ban' | 'utility'
  labelColor?: string
}>()

const emit = defineEmits<{
  (e: 'image-drop', payload: { imgId: string; zoneId: string }): void
  (e: 'image-restore', payload: { imgId: string }): void
}>()

const isOver = ref(false)

const imageId = computed(() => props.imageMap[props.zoneId])

const { currentStep } = useBanPickStep()

function handleDragStartEvent(event: DragEvent) {
  if (imageId.value && event.dataTransfer) {
    console.log(`onDragStart ${imageId.value}`)
    event?.dataTransfer?.setData('text/plain', imageId.value)
  }  
}

function handleDropEvent(event: DragEvent) {
  event.preventDefault()
  isOver.value = false
  const imgId = event.dataTransfer?.getData('text/plain')
  if (imgId) {
    console.log(`DropZone onDrop imgId ${imgId} zoneId ${props.zoneId}`)
    emit('image-drop', { imgId, zoneId: props.zoneId })
  }
}

function handleClickEvent(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.tagName === 'IMG' && imageId) {
    console.log(`DropZone onClick imgId ${imageId.value}`)
    emit('image-restore', { imgId: imageId.value })
  }
}

const isHighlighted = computed(() => {
  return props.zoneId === currentStep.value?.zoneId
})
</script>

<template>
  <div
    class="drop-zone"
    :class="[
      'drop-zone--' + (type || 'default'),
      { 'drop-zone--active': isOver, highlight: isHighlighted },
    ]"
    @dragover.prevent="isOver = true"
    @dragleave="isOver = false"
    @dragstart="handleDragStartEvent"
    @drop="handleDropEvent"
    @click="handleClickEvent"
  >
    <img v-if="imageId" :src="getWishImagePath(imageId)" />
    <span v-else class="drop-zone__label" :style="{ color: props.labelColor || '#888' }">{{
      label
    }}</span>
  </div>
</template>

<style scoped>
.drop-zone {
  width: 160px;
  height: 90px;
  position: relative;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  backdrop-filter: blur(4px);
  overflow: hidden;
}

.drop-zone--active {
  outline: 3px solid #ffaa00;
}

.drop-zone:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

.drop-zone img {
  height: auto;
  z-index: 15;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drop-zone.highlight {
  outline: 2px #ffcc00;
  background-color: rgba(255, 255, 200, 0.2);
  box-shadow:
    0 0 8px #ffd700,
    0 0 16px #ffc107;
  animation: highlightGlow 1.2s ease-in-out infinite;
  transform: scale(1.08);
}

@keyframes highlightGlow {
  0% {
    box-shadow: 0 0 5px #ffd700;
  }
  50% {
    box-shadow: 0 0 20px #ffc107;
  }
  100% {
    box-shadow: 0 0 5px #ffd700;
  }
}
/* 
.drop-zone.highlight {
  outline: 4px solid rgba(255, 200, 0, 0.9);
  box-shadow:
    0 0 10px rgba(255, 200, 0, 0.5),
    0 0 25px rgba(255, 150, 0, 0.6);
  animation: intensePulse 0.8s infinite ease-in-out;
  transform: scale(1.07);
  border-radius: 10px;
}

@keyframes intensePulse {
  0% {
    box-shadow: 0 0 8px rgba(255, 200, 0, 0.3);
  }

  50% {
    box-shadow: 0 0 20px rgba(255, 120, 0, 0.8);
  }

  100% {
    box-shadow: 0 0 8px rgba(255, 200, 0, 0.3);
  }
} */

.drop-zone__label {
  font-size: 1.25em;
  font-weight: 500;
  text-align: center;
  pointer-events: none;
  user-select: none;
  z-index: 10;
}
</style>
