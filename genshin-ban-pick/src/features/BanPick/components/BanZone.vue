<!-- src/features/BanPick/components/BanZone.vue -->

<script setup lang="ts">
import DropZone from './DropZone.vue'
import { ZoneType } from '@/types/IZone';

import type { IZone, IZoneImageEntry } from '@/types/IZone';

const props = defineProps<{
  zones?: number[]
  boardImageMap: Record<string, IZoneImageEntry>
}>()

const emit = defineEmits<{
  (e: 'image-drop', payload: { zoneImageEntry: IZoneImageEntry; zoneKey: string }): void
  (e: 'image-restore', payload: { zoneKey: string }): void
}>()

function chunk<T>(arr: T[], size: number): T[][] {
  const result = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

const rows = chunk(props.zones ?? [], 8)

function buildZone(id: number): IZone {
  return { id: id, zoneType: ZoneType.BAN }
}

// console.log('[BanZone] zones:', props.zones)

function handleImageDropped({ zoneImageEntry, zoneKey }: { zoneImageEntry: IZoneImageEntry; zoneKey: string }) {
  console.log(`BanZone handleImageDropped zoneImageEntry ${zoneImageEntry} zoneKey ${zoneKey}`)
  emit('image-drop', { zoneImageEntry, zoneKey })
}

function handleImageRestore({ zoneKey }: { zoneKey: string }) {
  console.log(`BanZone handleImageRestore zoneImageEntry ${zoneKey}`)
  emit('image-restore', { zoneKey })
}
</script>

<template>
  <div class="ban-zone__rows">
    <div class="grid__row" v-for="(row, rowIndex) in rows" :key="rowIndex">
      <template v-for="(n, colIndex) in row" :key="n">
      <DropZone
        :zone="buildZone(n + 1)"
        :boardImageMap="props.boardImageMap"
        :label="`Ban ${n + 1}`"
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
