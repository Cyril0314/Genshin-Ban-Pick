<!-- src/features/Tactical/TacticalPool.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { getProfileImagePath } from '@/utils/imageRegistry'
import { useTacticalBoardSync } from './composables/useTacticalBoardSync'

const props = defineProps<{ teamId: number }>()

const { cellMap, tacticalPoolImages } = useTacticalBoardSync(props.teamId)
const poolImages = computed(() =>
  tacticalPoolImages.value.filter((id) => !Object.values(cellMap.value).includes(id)),
)

function handleDragStart(event: DragEvent, id: string) {
    console.log(`onDragStart ${id}`)
    event?.dataTransfer?.setData('text/plain', id)
}
</script>

<template>
  <div class="tactical__pool"
  :class="`tactical__pool--${teamId}`">
    <img
      v-for="id in poolImages"
      :key="id"
      :src="getProfileImagePath(id)"
      draggable="true"
      @dragstart="handleDragStart($event, id)"
    />
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
  max-height: calc(var(--size-image-tactical-pool) * 3 + var(--gap) * 4);
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
