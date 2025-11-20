<!-- src/features/Tactical/TacticalBoard.vue -->
<script setup lang="ts">
import { computed } from 'vue';

import TacticalCell from './TacticalCell.vue';
import { useTacticalBoardStore } from '@/modules/board/store/tacticalBoardStore';
import { storeToRefs } from 'pinia';

import type { TeamMember } from '@/types/TeamMember';
import { useTeamTheme } from '@/composables/useTeamTheme';

const props = defineProps<{ teamSlot: number; teamMembers: Record<number, TeamMember> }>();

const emit = defineEmits<{
    (e: 'image-drop', payload: { teamSlot: number; cellId: number; imgId: string }): void;
    (e: 'image-restore', payload: { teamSlot: number; cellId: number }): void;
}>();

const tacticalBoardStore = useTacticalBoardStore();
const { teamTacticalBoardPanelMap, numberOfTeamSetup, numberOfSetupCharacter } = storeToRefs(tacticalBoardStore);

const tacticalBoardPanel = computed(() => teamTacticalBoardPanelMap.value[props.teamSlot]);

const rows = computed(() => numberOfTeamSetup.value);
const cols = computed(() => numberOfSetupCharacter.value);

const memberNames = computed(() => {
    // 如果成員不足 4 個，補空字串
    return Array.from({ length: numberOfSetupCharacter.value }, (_, i) => {
        const teamMember = props.teamMembers[i];
        if (!teamMember) return '';
        return teamMember.type === 'Manual' ? teamMember.name : teamMember.user.nickname;
    });
});

const setupNumbers = computed(() => {
    return Array.from({ length: numberOfTeamSetup.value }, (_, i) => {
        return `${i + 1}`;
    });
});

const cells = computed(() => {
    return Array.from({ length: rows.value * cols.value }, (_, i) => {
        // 將 i 轉換成 row 與 col（0-indexed）
        const row = Math.floor(i / cols.value);
        const col = i % cols.value;
        return { row, col, id: i };
    });
});

const themeVars = computed(() => {
  return useTeamTheme(props.teamSlot).themeVars.value
})

const imageId = (cellId: number) => tacticalBoardPanel.value.cellImageMap[cellId] ?? null;

function handleImageDrop({ cellId, imgId }: { cellId: number; imgId: string }) {
    console.debug(`[TATICAL BOARD] Handle image drop`, imgId, cellId);
    emit('image-drop', { teamSlot: props.teamSlot, cellId, imgId });
}

function handleImageRestore({ cellId }: { cellId: number }) {
    console.debug(`[TATICAL BOARD] Handle image restore`, cellId);
    emit('image-restore', { teamSlot: props.teamSlot, cellId });
}
</script>

<template>
    <div class="tactical__board" :style="{ '--number-of-team-setup': numberOfTeamSetup, '--number-of-setup-character': numberOfSetupCharacter, ...themeVars }">
        <div class="tactical__member-names">
            <div class="tactical__header"></div>
            <div v-for="(memberName, index) in memberNames" :key="index" class="tactical__member-name">
                <span class="text">{{ memberName }}</span>
            </div>
        </div>
        <div class="tactical__setup">
            <div class="tactical__setup-numbers">
                <div v-for="(setupNumber, index) in setupNumbers" :key="index" class="tactical__setup-number">
                    <span class="text">{{ setupNumber }}</span>
                </div>
            </div>
            <div class="tactical__grid">
                <template v-for="cell in cells">
                    <TacticalCell 
                    :cellId="cell.id" 
                    :imageId="imageId(cell.id)" 
                    :teamSlot="props.teamSlot"
                    @image-drop="handleImageDrop"
                    @image-restore="handleImageRestore" />
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tactical__board {
    --size-setup-number: calc(var(--base-size) * 1.5);
    --size-tactical-cell: calc(var(--base-size) * 5.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--space-md);
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: var(--radius-lg);
    /* outline: 2px solid var(--team-color); */
}

.tactical__member-names {
    display: flex;
    flex-direction: row;
}

.tactical__setup {
    display: flex;
    flex-direction: row;
}

.tactical__setup-numbers {
    display: flex;
    flex-direction: column;
}

.tactical__grid {
    display: grid;
    grid-template-columns: repeat(var(--number-of-setup-character), auto);
    grid-template-rows: repeat(var(--number-of-team-setup), auto);
    justify-content: center;
}

.tactical__member-name,
.tactical__setup-number {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    /* pointer-events: none; */
}

.tactical__header {
    flex-shrink: 0;
    height: calc(var(--base-size) * 3);
    width: var(--size-setup-number);
}

.tactical__member-name {
    height: calc(var(--base-size) * 3);
    padding: 0 var(--space-sm);
}

.tactical__setup-number {
    height: 100%;
    width: var(--size-setup-number);
}

.tactical__member-name .text,
.tactical__setup-number .text {
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
    
    text-align: center;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family-tech-ui);
    color: var(--team-color);
    z-index: 11;
}

.tactical__member-name .text {
    width: var(--size-tactical-cell);
}
</style>
