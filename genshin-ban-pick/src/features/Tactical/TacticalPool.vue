<!-- src/features/Tactical/TacticalPool.vue -->
<script setup lang="ts">
import { getProfileImagePath } from '@/utils/imageRegistry'
import { DragTypes } from '@/constants/customMIMETypes';
import { useTacticalBoardStore } from '@/stores/tacticalBoardStore';

const props = defineProps<{ teamId: number }>()

const tacticalBoardStore = useTacticalBoardStore()
const { displayPoolImageIds } = tacticalBoardStore

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
.tactical__pool {
  --size-image-tactical-pool: calc(var(--base-size) * 2.9);
  --gap: var(--space-sm);
  display: grid;
  grid-template-columns: repeat(auto-fit, var(--size-image-tactical-pool));
  align-content: start;
  justify-content: start;
  background: var(--md-sys-color-surface-container);
  min-height: calc(var(--size-image-tactical-pool) * 4 + var(--gap) * 5);
  /* 維持最小高度 */
  border-radius: var(--border-radius-xs);
  gap: var(--gap);
  padding: var(--gap);
  overflow-y: scroll;
  scrollbar-width: none;
}

.tactical__pool img {
  width: 100%;
  aspect-ratio: 1 / 1;
  cursor: grab;
}
</style>
