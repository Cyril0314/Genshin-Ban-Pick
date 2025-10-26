<!-- src/features/Tactical/TacticalPool.vue -->
<script setup lang="ts">

import { getProfileImagePath } from '@/utils/imageRegistry'
import { DragTypes } from '@/constants/customMIMETypes';
import { useTaticalBoardStore } from '@/stores/tacticalBoardStore';

const props = defineProps<{ teamId: number }>()

const taticalBoardStore = useTaticalBoardStore()
const { displayPoolImageIds } = taticalBoardStore

function handleDragStartEvent(event: DragEvent, id: string) {
  console.debug(`[TATICAL POOL] Handle drag start event`, id);
  event?.dataTransfer?.setData(DragTypes.CHARACTER_IMAGE, id)
}
</script>

<template>
  <div class="tactical__pool" :class="`tactical__pool--${props.teamId}`">
    <img v-for="id in displayPoolImageIds(teamId).value" :key="id" :src="getProfileImagePath(id)" draggable="true"
      @dragstart="handleDragStartEvent($event, id)" />
  </div>
</template>

<style scoped>
.tactical__pool--0 {
  --tactical__pool-bg: var(--md-sys-color-on-secondary-container-alpha);
}

.tactical__pool--1 {
  --tactical__pool-bg: var(--md-sys-color-on-tertiary-container-alpha);
}

.tactical__pool {
  --gap: var(--space-xs);
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--size-image-tactical-pool));
  align-content: start;
  justify-content: start;
  background: var(--tactical__pool-bg);
  height: calc(var(--size-image-tactical-pool) * 3 + var(--gap) * 4);
  /* 維持最小高度 */
  max-height: calc(var(--size-image-tactical-pool) * 3 + var(--gap) * 4);
  /* 維持最大高度 */
  border-radius: var(--border-radius-xs);
  overflow-y: auto;
  gap: var(--gap);
  padding: var(--gap);
}

.tactical__pool img {
  width: 100%;
  aspect-ratio: 1 / 1;
  cursor: grab;
}
</style>
