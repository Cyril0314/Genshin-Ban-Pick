<!-- src/features/BanPick/components/UtilityZone.vue -->
 
<script setup lang="ts">
import DropZone from './DropZone.vue'

import type { IZone } from '@/types/IZone';

const props = defineProps<{
  zones: IZone[]
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

const columns = chunk(props.zones ?? [], 4)

// console.log('[UtilityZone] zones:', props.zones)

function handleImageDropped({ imgId, zoneId }: { imgId: string; zoneId: number }) {
  console.log(`UtilityZone handleImageDropped imgId ${imgId} zoneId ${zoneId}`)
  emit('image-drop', { imgId, zoneId })
}

function handleImageRestore({ zoneId }: { zoneId: number }) {
  console.log(`UtilityZone handleImageRestore zoneId ${zoneId}`)
  emit('image-restore', { zoneId })
}
</script>

<template>
  <div class="utility-zone__columns">
    <div class="grid__column grid__column--center" v-for="(col, index) in columns" :key="index">
      <DropZone
        v-for="zone in col"
        :zone="zone"
        :boardImageMap="props.boardImageMap"
        :label="`Utility`"
        :labelColor="'var(--md-sys-color-on-primary-container)'"
        @image-drop="handleImageDropped"
        @image-restore="handleImageRestore"
      />
    </div>
  </div>
</template>

<style scoped>
.utility-zone__columns {
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
