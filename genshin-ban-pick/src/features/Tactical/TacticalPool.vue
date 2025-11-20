<!-- src/features/Tactical/TacticalPool.vue -->
<script setup lang="ts">
import { getProfileImagePath } from '@/utils/imageRegistry'
import { DragTypes } from '@/constants/customMIMETypes';
import { useTacticalBoardStore } from '@/modules/board/store/tacticalBoardStore';

const props = defineProps<{ teamSlot: number }>()

const tacticalBoardStore = useTacticalBoardStore()
const { displayPoolImageIds } = tacticalBoardStore

function handleDragStartEvent(event: DragEvent, id: string) {
  console.debug(`[TATICAL POOL] Handle drag start event`, id);
  event?.dataTransfer?.setData(DragTypes.CHARACTER_IMAGE, id)
}
</script>

<template>
  <div class="tactical__pool" :class="`tactical__pool--${props.teamSlot}`">
    <img v-for="id in displayPoolImageIds(teamSlot).value" :key="id" :src="getProfileImagePath(id)" draggable="true"
      @dragstart="handleDragStartEvent($event, id)" />
  </div>
</template>

<style scoped>
.tactical__pool {
  --size-image-tactical-pool: calc(var(--base-size) * 4);
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--size-image-tactical-pool));
  align-content: start;
  justify-content: start;
  background-color: var(--md-sys-color-surface-container);
  min-height: calc(var(--size-image-tactical-pool) * 3);
  /* 維持最小高度 */
  border-radius: var(--radius-lg);
  overflow-y: scroll;
  scrollbar-width: none;
  outline: 2px solid var(--md-sys-color-outline);
}

.tactical__pool img {
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  cursor: grab;
  transition: 
    filter 0.18s ease,
    transform 0.18s ease,;
  filter: saturate(0.8) brightness(0.9);
}

.tactical__pool img:hover {
  background-color: var(--md-sys-color-state-hover);
  transform: scale(1.05);
  filter: initial;
}

.tactical__pool img:focus {
  background-color: var(--md-sys-color-state-focus);
  filter: none;
}
</style>
