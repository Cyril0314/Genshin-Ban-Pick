<!-- src/features/BanPick/BanZone.vue -->

<script setup lang="ts">
import DropZone from './DropZone.vue'

const props = defineProps<{
  count: number
  totalRounds: number
}>()

const zones = Array.from({ length: props.count }, (_, i) => {
  return `ban-${i + 1}`
})
</script>

<template>
    <div class="ban-zone__rows">
        <div class="grid__row" v-for="(chunk, rowIndex) in chunked(zones, 8)" :key="rowIndex">
            <DropZone v-for="zoneId in chunk" :key="zoneId" :zoneId="zoneId" />
        </div>
    </div>
</template>

<script lang="ts">
// chunk array every 8
function chunked<T>(arr: T[], size: number): T[][] {
    const result = []
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size))
    }
    return result
}
</script>

<style scoped>
.ban-zone__rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.grid__row {
    display: flex;
    gap: 8px;
}
</style>