<!-- src/features/Tactical/TacticalBoard.vue -->
<script setup lang="ts">
import { computed } from 'vue';

import TacticalCell from './TacticalCell.vue';
import { useTaticalBoardStore } from '@/stores/tacticalBoardStore';
import { storeToRefs } from 'pinia';

import type { TeamMember } from '@/types/ITeam';

const rows = 4;
const cols = 5;
const props = defineProps<{ teamId: number; teamMembers: TeamMember[] }>();

const emit = defineEmits<{
    (e: 'image-drop', payload: { teamId: number, imgId: string, cellId: string }): void
    (e: 'image-restore', payload: { teamId: number, cellId: string }): void
}>()


const taticalBoardStore = useTaticalBoardStore();
const { teamTaticalBoardPanelMap } = storeToRefs(taticalBoardStore);
const { placeCellImage, removeCellImage } = taticalBoardStore;

const taticalBoardPanel = computed(() => teamTaticalBoardPanelMap.value[props.teamId]);

const memberCells = computed(() => {
    // 如果成員不足 4 個，補空字串
    return Array.from({ length: 4 }, (_, i) => {
        const teamMember = props.teamMembers[i];
        if (!teamMember) return '';
        return teamMember.type === 'manual' ? teamMember.name : teamMember.user.nickname;
    });
});

const boardCells = computed(() => {
    return Array.from({ length: rows * cols }, (_, i) => {
        // 將 i 轉換成 row 與 col（0-indexed）
        const row = Math.floor(i / cols);
        const col = i % cols;
        return { row, col, id: `cell-${i + 1}` };
    });
});

const imageId = (cellId: string) => taticalBoardPanel.value.cellImageMap[cellId] ?? null;

function handleImageDrop({ cellId, imgId }: { cellId: string; imgId: string }) {
    console.debug(`[TATICAL BOARD] Handle image drop`, imgId, cellId);
    // placeCellImage(props.teamId, cellId, imgId);

    emit('image-drop', { teamId: props.teamId, imgId, cellId })
}

function handleImageRestore({ cellId }: { cellId: string }) {
    console.debug(`[TATICAL BOARD] Handle image restore`, cellId);
    // removeCellImage(props.teamId, cellId);

    emit('image-restore', { teamId: props.teamId, cellId })
}
</script>

<template>
    <div class="tactical__grid">
        <div class="tactical__cell tactical__cell--header"></div>
        <div v-for="(member, index) in memberCells" :key="index" class="tactical__cell tactical__cell--member">
            <span class="text">{{ member }}</span>
        </div>
        <template v-for="cell in boardCells" :key="cell.id">
            <div v-if="cell.col === 0" class="tactical__cell tactical__cell--team-number">
                <span class="text">{{ cell.row + 1 }}</span>
            </div>
            <TacticalCell v-else :cellId="cell.id" :imageId="imageId(cell.id)" @image-drop="handleImageDrop"
                @image-restore="handleImageRestore" />
        </template>
    </div>
</template>

<style scoped>
.tactical__grid {
    --size-team-number: calc(var(--base-size) / 2);
    --size-tactical-cell: calc(var(--base-size) * 5);
    display: grid;
    justify-content: center;
    grid-template-columns: repeat(5, auto);
    grid-template-rows: repeat(5, auto);
    padding: var(--space-xs);
}

.tactical__cell--member,
.tactical__cell--team-number {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: start;
    z-index: 10;
    padding: var(--space-sm);
    /* pointer-events: none; */
}

.tactical__cell--member {
    height: calc(var(--base-size) * 2);
}

.tactical__cell--team-number {
    height: 100%;
}

.tactical__cell--team-number .text,
.tactical__cell--member .text {
    display: -webkit-box;
    /* 需要配合使用 */
    -webkit-box-orient: vertical;
    /* 需要配合使用 */
    -webkit-line-clamp: 2;
    /* 限制为两行 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    overflow: hidden;
    width: var(--size-tactical-cell);

    text-align: center;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family-tech-ui);
    color: var(--md-sys-color-on-surface);
    z-index: 11;
}

.tactical__cell--team-number .text {
    width: var(--size-team-number);
}

.tactical__cell--member .text {
    width: var(--size-tactical-cell);
}
</style>
