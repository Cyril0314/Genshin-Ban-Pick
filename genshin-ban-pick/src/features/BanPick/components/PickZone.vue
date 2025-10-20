<!-- src/features/BanPick/components/PickZone.vue -->

<script setup lang="ts">
import DropZone from './DropZone.vue'
import { ZoneType } from '@/types/IZone';

import type { IZone, IZoneImageEntry } from '@/types/IZone';

const props = defineProps<{
  zones?: number[]
  side: 'left' | 'right'
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

const columns = chunk(props.zones ?? [], 8)

function buildZone(id: number): IZone {
  return { id: id, zoneType: ZoneType.PICK }
}

// console.log('[PickZone] zones:', props.zones)

function handleImageDropped({ zoneImageEntry, zoneKey }: { zoneImageEntry: IZoneImageEntry; zoneKey: string }) {
  console.log(`PickZone handleImageDropped zoneImageEntry ${zoneImageEntry} zoneKey ${zoneKey}`)
  emit('image-drop', { zoneImageEntry, zoneKey })
}

function handleImageRestore({ zoneKey }: { zoneKey: string }) {
  console.log(`PickZone handleImageRestore zoneKey ${zoneKey}`)
  emit('image-restore', { zoneKey })
}
</script>

<template>
  <div :class="['pick-zone__columns', `pick-zone__columns--${props.side}`]">
    <div class="grid__column grid__column--side" v-for="(col, index) in columns" :key="index">
      <DropZone
        v-for="n in col"
        :key="n"
        :zone="buildZone(n + 1)"
        :boardImageMap="props.boardImageMap"
        :label="`Pick ${n + 1}`"
        :labelColor="side === 'left' ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-tertiary-container)'"
        @image-drop="handleImageDropped"
        @image-restore="handleImageRestore"
      />
    </div>
  </div>
</template>

<style scoped>
.pick-zone__columns {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--size-drop-zone-line-space);
}

.grid__column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--size-drop-zone-item-space);
}
</style>
