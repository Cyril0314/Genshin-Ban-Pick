<!-- src/features/BanPick/components/PickZone.vue -->

<script setup lang="ts">
import DropZone from './DropZone.vue'

const props = defineProps<{
  zones?: number[]
  side: 'left' | 'right'
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

const columns = chunk(props.zones ?? [], 8)

console.log('[PickZone] zones:', props.zones)

function handleImageDropped({ imgId, zoneId }: { imgId: string; zoneId: string }) {
  console.log(`PickZone handleImageDropped imgId ${imgId} zoneId ${zoneId}`)
  emit('image-drop', { imgId, zoneId })
}

function handleImageRestore({ imgId }: { imgId: string }) {
  console.log(`PickZone handleImageRestore imgId ${imgId}`)
  emit('image-restore', { imgId })
}
</script>

<template>
  <div :class="['pick-zone__columns', `pick-zone__columns--${props.side}`]">
    <div class="grid__column grid__column--side" v-for="(col, index) in columns" :key="index">
      <DropZone
        v-for="n in col"
        :key="n"
        :zoneId="`zone-pick-${n + 1}`"
        :imageMap="props.imageMap"
        :label="`Pick ${n + 1}`"
        type="pick"
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
