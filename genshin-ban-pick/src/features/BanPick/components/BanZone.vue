<!-- src/features/BanPick/components/BanZone.vue -->

<script setup lang="ts">
import { computed } from 'vue'
import DropZone from './DropZone.vue'

const props = defineProps<{
  zones?: number[]
  imageMap: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'image-drop', payload: { imgId: string; zoneId: string }): void
  (e: 'image-restore', payload: { imgId: string }): void
}>()

function chunk<T>(arr: T[], size: number): T[][] {
  const result = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

const rows = chunk(props.zones ?? [], 8)

console.log('[BanZone] zones:', props.zones)

function handleImageDropped({ imgId, zoneId }: { imgId: string; zoneId: string }) {
  console.log(`BanZone handleImageDropped imgId ${imgId} zoneId ${zoneId}`)
  emit('image-drop', { imgId, zoneId })
}

function handleImageRestore({ imgId }: { imgId: string }) {
  console.log(`BanZone handleImageRestore imgId ${imgId}`)
  emit('image-restore', { imgId })
}
</script>

<template>
  <div class="ban-zone__rows">
    <div class="grid__row" v-for="(row, rowIndex) in rows" :key="rowIndex">
      <DropZone
        v-for="n in row"
        :key="n"
        :zoneId="`zone-ban-${n + 1}`"
        :imageMap="props.imageMap"
        :label="`Ban ${n + 1}`"
        type="ban"
        :labelColor="'#4e4040'"
        @image-drop="handleImageDropped"
        @image-restore="handleImageRestore"
      />
    </div>
  </div>
</template>

<style scoped>
.ban-zone__rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.grid__row {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
</style>
