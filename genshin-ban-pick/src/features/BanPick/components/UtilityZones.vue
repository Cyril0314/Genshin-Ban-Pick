<!-- src/features/BanPick/components/UtilityZone.vue -->

<script setup lang="ts">
import DropZone from './DropZone.vue';

import type { IZone } from '@/types/IZone';

const props = defineProps<{
    zones: IZone[];
    maxPerRow: number;
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

const zoneMatrix = chunk(props.zones ?? [], props.maxPerRow);

function handleImageDrop({ zoneId, imgId }: { zoneId: number; imgId: string }) {
    console.debug(`[UTILITY ZONES] Handle image drop`, zoneId, imgId);
    emit('image-drop', { zoneId, imgId });
}

function handleImageRestore({ zoneId }: { zoneId: number }) {
    console.debug(`[UTILITY ZONES] Handle image restore`, zoneId);
    emit('image-restore', { zoneId });
}
</script>

<template>
    <div class="utility-zone">
        <div class="grid__row" v-for="(zones, rowIndex) in zoneMatrix" :key="rowIndex">
            <template v-for="(zone, columnIndex) in zones" :key="columnIndex">
                <DropZone
                    :zone="zone"
                    :boardImageMap="props.boardImageMap"
                    :label="`Utility`"
                    :labelColor="'var(--md-sys-color-on-primary-container)'"
                    @image-drop="handleImageDrop"
                    @image-restore="handleImageRestore"
                />
            </template>
        </div>
    </div>
</template>

<style scoped>
.utility-zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--size-drop-zone-line-space);
}

.grid__row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--size-drop-zone-item-space);
}
</style>
