<!-- src/features/BanPick/components/UtilityZone.vue -->
 
<script setup lang="ts">
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

const columns = chunk(props.zones ?? [], 4)

console.log('[UtilityZone] zones:', props.zones)

function handleImageDropped({ imgId, zoneId }: { imgId: string; zoneId: string }) {
  console.log(`UtilityZone handleImageDropped imgId ${imgId} zoneId ${zoneId}`)
  emit('image-drop', { imgId, zoneId })
}

function handleImageRestore({ imgId }: { imgId: string }) {
  console.log(`UtilityZone handleImageRestore imgId ${imgId}`)
  emit('image-restore', { imgId })
}
</script>

<template>
  <div class="utility-zone__columns">
    <div class="grid__column grid__column--center" v-for="(col, index) in columns" :key="index">
      <DropZone
        v-for="n in col"
        :key="n"
        :zoneId="`zone-utility-${n + 1}`"
        :imageMap="props.imageMap"
        :label="`Utility`"
        type="utility"
        :labelColor="'var(--md-sys-color-primary)'"
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
  gap: var(--space-sm);
}

.grid__column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}
</style>
