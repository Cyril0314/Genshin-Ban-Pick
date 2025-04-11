<!-- src/features/BanPick/UtilityZone.vue -->
<script setup lang="ts">
import DropZone from './DropZone.vue'

const props = defineProps < {
    count: number
} > ()

const zones = Array.from({ length: props.count }, (_, i) => {
    return `utility-${i + 1}`
})
</script>

<template>
    <div class="grid__column grid__column--center">
        <DropZone v-for="zoneId in zones" :key="zoneId" :zoneId="zoneId" />
    </div>
</template>

<style scoped>
.grid__column--center {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>