<!-- src/features/BanPick/PickZone.vue -->

<script setup lang="ts">
import DropZone from './DropZone.vue'

const props = defineProps < {
    side: 'left' | 'right'
  count: number
} > ()

const zones = Array.from({ length: props.count }, (_, i) => {
    return `pick-${props.side}-${i + 1}`
})
</script>

<template>
    <div class="grid__column grid__column--side">
        <DropZone v-for="zoneId in zones" :key="zoneId" :zoneId="zoneId" />
    </div>
</template>

<style scoped>
.grid__column--side {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
</style>