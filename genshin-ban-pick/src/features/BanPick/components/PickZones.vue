<!-- src/features/BanPick/components/PickZone.vue -->

<script setup lang="ts">
import DropZone from './DropZone.vue';

import type { IZone } from '@/types/IZone';

const props = defineProps<{
    zones: IZone[];
    side: 'left' | 'right';
    maxPerColumn: number;
    boardImageMap: Record<number, string>;
}>();

const emit = defineEmits<{
    (e: 'image-drop', payload: { imgId: string; zoneId: number }): void;
    (e: 'image-restore', payload: { zoneId: number }): void;
}>();

function chunk<T>(arr: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

const zoneMatrix = chunk(props.zones ?? [], props.maxPerColumn);

function handleImageDrop({ imgId, zoneId }: { imgId: string; zoneId: number }) {
    console.debug(`[PICK ZONES] Handle image drop`, imgId, zoneId);
    emit('image-drop', { imgId, zoneId });
}

function handleImageRestore({ zoneId }: { zoneId: number }) {
    console.debug(`[PICK ZONES] Handle image restore`, zoneId);
    emit('image-restore', { zoneId });
}
</script>

<template>
    <div :class="['pick-zone', `pick-zone--${props.side}`]">
        <div class="grid__column grid__column--side" v-for="(zones, columnIndex) in zoneMatrix" :key="columnIndex">
            <template v-for="(zone, rowIndex) in zones" :key="rowIndex">
                <DropZone :zone="zone" :boardImageMap="props.boardImageMap" :label="`Pick ${zone.order + 1}`"
                    :labelColor="side === 'left' ? 'var(--md-sys-color-secondary-container)' : 'var(--md-sys-color-tertiary-container)'"
                    @image-drop="handleImageDrop" @image-restore="handleImageRestore" />
            </template>
        </div>
    </div>
</template>

<style scoped>
.pick-zone--left {
    --flex-direction: row;
}

.pick-zone--right {
    --flex-direction: row-reverse;
}

.pick-zone {
    display: flex;
    flex-direction: var(--flex-direction);
    align-items: start;
    gap: var(--size-drop-zone-line-space);
}

.grid__column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--size-drop-zone-item-space);
}
</style>
