<!-- src/modules/board/ui/components/PickZones.vue -->

<script setup lang="ts">
import { computed } from 'vue';

import DropZone from './DropZone.vue';
import { chunk } from '@/modules/shared/utils/array';

import type { IZone } from '@shared/contracts/board/IZone';

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

const emitters = {
    imageDrop: (payload: { zoneId: number; imgId: string }) =>
        emit('image-drop', payload),

    imageRestore: (payload: { zoneId: number }) =>
        emit('image-restore', payload),
};

const zoneMatrix = computed(() =>
  chunk(props.zones ?? [], props.maxPerColumn)
)

// 容器只有橫向溢出，滑鼠滾輪是縱向 delta、瀏覽器不會自動轉成橫向捲動，捲軸又隱藏，
// 所以把縱向滾輪轉成 scrollLeft。右側是 row-reverse，溢出在左邊、scrollLeft 往負走，要反向。
function handleWheel(e: WheelEvent) {
    const el = e.currentTarget as HTMLElement;
    if (el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // 觸控板橫向滑動本來就能動，不干涉

    // deltaMode 0 = 像素；1 = 行（Firefox 預設，一格約 3 行）；2 = 頁。統一換算成像素
    const pixelsPerUnit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? el.clientWidth : 1;
    const delta = e.deltaY * pixelsPerUnit;

    const before = el.scrollLeft;
    el.scrollLeft += props.side === 'right' ? -delta : delta;
    // 真的有捲到才吃掉事件；已經捲到底就放行
    if (el.scrollLeft !== before) e.preventDefault();
}

</script>

<template>
    <div :class="['pick-zone', `pick-zone--${props.side}`]" @wheel="handleWheel">
        <div class="column" v-for="(zones, columnIndex) in zoneMatrix" :key="columnIndex">
            <template v-for="(zone, rowIndex) in zones" :key="rowIndex">
                <DropZone :zone="zone" :boardImageMap="props.boardImageMap" :label="`Pick ${zone.order + 1}`"
                    @image-drop="emitters.imageDrop" @image-restore="emitters.imageRestore" />
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
    /* 最多顯示兩欄，第三欄起靠 overflow 滑動 */
    max-width: calc(2 * var(--size-drop-zone-width) + 3 * var(--size-drop-zone-space));
    overflow-x: auto;
    scrollbar-width: none;
}

.pick-zone::-webkit-scrollbar {
    display: none;
}

.column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--size-drop-zone-space);
}
</style>
