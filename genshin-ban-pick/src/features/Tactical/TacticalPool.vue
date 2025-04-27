<!-- src/features/Tactical/TacticalPool.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { getProfileImagePath } from '@/utils/imageRegistry'
import { useTacticalBoardSync } from './composables/useTacticalBoardSync'

const props = defineProps<{ team: 'aether' | 'lumine' }>()

const { cellMap, tacticalPoolImages } = useTacticalBoardSync(props.team)
const poolImages = computed(() =>
  tacticalPoolImages.value.filter((id) => !Object.values(cellMap.value).includes(id)),
)

function handleDragStart(event: DragEvent, id: string) {
    console.log(`onDragStart ${id}`)
    event?.dataTransfer?.setData('text/plain', id)
}
</script>

<template>
  <div class="tactical__pool">
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
.tactical__pool {
  --gap: var(--space-xs);
  display: grid;
  grid-template-columns: repeat(auto-fill, var(--size-image-sm));
  background: var(--md-sys-color-surface-container-high-alpha);
  min-height: calc(var(--size-image-sm) * 2 + var(--gap) * 3);
  max-height: calc(var(--size-image-sm) * 2 + var(--gap) * 3);
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
