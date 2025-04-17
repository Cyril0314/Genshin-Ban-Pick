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
  display: flex;
  flex-wrap: wrap;
  background: rgba(0, 0, 0, 0.1);
  width: 440px;
  height: 170px;
  min-height: 170px;
  overflow-y: auto;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
}

.tactical__pool img {
  width: 75px;
  cursor: grab;
}
</style>
