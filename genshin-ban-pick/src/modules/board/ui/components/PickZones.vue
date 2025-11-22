<!-- src/modules/board/ui/components/PickZones.vue -->

<script setup lang="ts">
import DropZone from './DropZone.vue';

import type { IZone } from "../../types/IZone";

const props = defineProps<{
    zones: IZone[];
    side: 'left' | 'right';
    maxPerColumn: number;
    boardImageMap: Record<number, string>;
}>();

const emit = defineEmits<{
    (e: 'image-drop', payload: { zoneId: number; imgId: string }): void;
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

function handleImageDrop({ zoneId, imgId }: { zoneId: number; imgId: string }) {
    console.debug(`[PICK ZONES] Handle image drop`, zoneId, imgId);
    emit('image-drop', { zoneId, imgId });
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
                    @image-drop="handleImageDrop" @image-restore="handleImageRestore" />
            </template>
        </div>
    </div>
</template>

<style scoped>
.pick-zone--left {
    --flex-direction: row;
    background-color: color-mix(in srgb, var(--md-sys-color-surface-container) 68%, var(--team-first-color) 32%);

}

.pick-zone--right {
    --flex-direction: row-reverse;
    background-color: color-mix(in srgb, var(--md-sys-color-surface-container) 68%, var(--team-second-color) 32%);
}

.pick-zone {
    display: flex;
    flex-direction: var(--flex-direction);
    align-items: start;
    padding: var(--size-drop-zone-space);
    gap: var(--size-drop-zone-space);
    border-radius: var(--radius-lg);
    background-color: var(--md-sys-color-surface-container-high);
}

.grid__column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--size-drop-zone-space);
}
</style>
