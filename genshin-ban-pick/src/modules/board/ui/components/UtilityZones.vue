<!-- src/modules/board/ui/components/UtilityZones.vue -->

<script setup lang="ts">
import { computed } from 'vue';

import DropZone from './DropZone.vue';
import { chunk } from '@/modules/shared/utils/array';

import type { IZone } from '@shared/contracts/board/IZone';

const props = defineProps<{
    zones: IZone[];
    maxPerRow: number;
    boardImageMap: Record<number, string>;
}>();

const emit = defineEmits<{
    (e: 'image-drop', payload: { zoneId: number; imgId: string }): void;
    (e: 'image-restore', payload: { zoneId: number }): void;
}>();

const emitters = {
    imageDrop: (payload: { zoneId: number; imgId: string }) =>
        emit('image-drop', payload),

    imageRestore: (payload: { zoneId: number }) =>
        emit('image-restore', payload),
};

const zoneMatrix = computed(() =>
  chunk(props.zones ?? [], props.maxPerRow)
)

</script>

<template>
    <div class="utility-zone">
        <div class="grid__row" v-for="(zones, rowIndex) in zoneMatrix" :key="rowIndex">
            <template v-for="(zone, columnIndex) in zones" :key="columnIndex">
                <DropZone
                    :zone="zone"
                    :boardImageMap="props.boardImageMap"
                    :label="`Utility ${zone.order + 1}`"
                    @image-drop="emitters.imageDrop"
                    @image-restore="emitters.imageRestore"
                />
            </template>
        </div>
    </div>
</template>

<style scoped>
.utility-zone {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    padding: var(--size-drop-zone-space);
    gap: var(--size-drop-zone-space);
    border-radius: var(--radius-lg);
    background-color: color-mix(in srgb, var(--md-sys-color-surface-container) 68%, var(--md-sys-color-tertiary) 32%);
    background-color: var(--md-sys-color-surface-container-high);
}

.grid__row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--size-drop-zone-space);
}
</style>
