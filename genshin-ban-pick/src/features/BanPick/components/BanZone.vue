<!-- src/features/BanPick/components/BanZone.vue -->

<script setup lang="ts">
import DropZone from './DropZone.vue'

import type { IZone } from '@/types/IZone';

const props = defineProps<{
  zones: IZone[]
  maxPerRow: number
  boardImageMap: Record<number, string>
}>()

const emit = defineEmits<{
  (e: 'image-drop', payload: { imgId: string; zoneId: number }): void
  (e: 'image-restore', payload: { zoneId: number }): void
}>()

function chunk<T>(arr: T[], size: number): T[][] {
  const result = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

const rows = chunk(props.zones ?? [], props.maxPerRow)

// console.log('[BanZone] zones:', props.zones)

function handleImageDropped({ imgId, zoneId }: { imgId: string; zoneId: number }) {
  console.log(`BanZone handleImageDropped imgId ${imgId} zoneId ${zoneId}`)
  emit('image-drop', { imgId, zoneId })
}

function handleImageRestore({ zoneId }: { zoneId: number }) {
  console.log(`BanZone handleImageRestore zoneId ${zoneId}`)
  emit('image-restore', { zoneId })
}
</script>

<template>
  <div class="ban-zone__rows">
    <div class="grid__row" v-for="(row, rowIndex) in rows" :key="rowIndex">
      <template v-for="(zone, colIndex) in row" :key="zone">
      <DropZone
        :zone="zone"
        :boardImageMap="props.boardImageMap"
        :label="`Ban ${zone.order + 1}`"
        :labelColor="'var(--md-sys-color-error)'"
        @image-drop="handleImageDropped"
        @image-restore="handleImageRestore"
      />
      <div
        v-if="(colIndex + 1) % (row.length / 2) === 0 && colIndex !== row.length - 1"
        class="grid__spacer"
      ></div>
    </template>
    </div>
  </div>
</template>

<style scoped>
.ban-zone__rows {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-drop-zone-line-space);
}

.grid__row {
  display: flex;
  flex-direction: row;
  gap: var(--size-drop-zone-item-space);
}

.grid__spacer {
  width: var(--size-ban-row-spacer);
  height: 100%;
}
</style>
