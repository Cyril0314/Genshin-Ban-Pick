<!-- src/modules/lineup/ui/components/LineupBoard.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { createLogger } from '@/app/utils/logger';
import { useTeamTheme } from '@/modules/shared/ui/composables/useTeamTheme';
import LineupCell from './LineupCell.vue';
import { useLineupStore } from '../../store/lineupStore';

import type { TeamMember } from '@shared/contracts/team/TeamMember';

const props = defineProps<{ teamSlot: number; teamMembers: Record<number, TeamMember> }>();

const emit = defineEmits<{
    (e: 'image-drop', payload: { teamSlot: number; cellId: number; imgId: string }): void;
    (e: 'image-restore', payload: { teamSlot: number; cellId: number }): void;
}>();

const lineupStore = useLineupStore();
const { teamLineupImageMap, numberOfTeamSetup, numberOfSetupCharacter } = storeToRefs(lineupStore);

const lineupImageMap = computed(() => teamLineupImageMap.value[props.teamSlot]);

const rows = computed(() => numberOfTeamSetup.value);
const cols = computed(() => numberOfSetupCharacter.value);

const memberNames = computed(() => {
    // 如果成員不足 4 個，補空字串
    return Array.from({ length: numberOfSetupCharacter.value }, (_, i) => {
        const teamMember = props.teamMembers[i];
        if (!teamMember) return '';
        return teamMember.type === 'Name' ? teamMember.name : teamMember.nickname;
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

const logger = createLogger('lineup.ui.board');
const imageId = (cellId: number) => lineupImageMap.value[cellId];

function handleImageDrop({ cellId, imgId }: { cellId: number; imgId: string }) {
    logger.debug('image drop', imgId, cellId);
    emit('image-drop', { teamSlot: props.teamSlot, cellId, imgId });
}

function handleImageRestore({ cellId }: { cellId: number }) {
    logger.debug('image restore', cellId);
    emit('image-restore', { teamSlot: props.teamSlot, cellId });
}
</script>

<template>
    <div class="lineup-board" :style="{ '--number-of-team-setup': numberOfTeamSetup, '--number-of-setup-character': numberOfSetupCharacter, ...themeVars }">
        <div class="member-names">
            <div class="corner-spacer"></div>
            <div v-for="(memberName, index) in memberNames" :key="index" class="member-name">
                <span class="text">{{ memberName }}</span>
            </div>
        </div>
        <div class="setup">
            <div class="setup-numbers">
                <div v-for="(setupNumber, index) in setupNumbers" :key="index" class="setup-number">
                    <span class="text">{{ setupNumber }}</span>
                </div>
            </div>
            <div class="grid">
                <template v-for="cell in cells">
                    <LineupCell
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
.lineup-board {
    --size-setup-number: calc(var(--base-size) * 1.5);
    --size-lineup-cell: calc(var(--base-size) * 5.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--space-md);
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: var(--radius-lg);
}

.member-names {
    display: flex;
    flex-direction: row;
}

.setup {
    display: flex;
    flex-direction: row;
}

.setup-numbers {
    display: flex;
    flex-direction: column;
}

.grid {
    display: grid;
    grid-template-columns: repeat(var(--number-of-setup-character), auto);
    grid-template-rows: repeat(var(--number-of-team-setup), auto);
    justify-content: center;
}

.member-name,
.setup-number {
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.corner-spacer {
    flex-shrink: 0;
    height: calc(var(--base-size) * 3);
    width: var(--size-setup-number);
}

.member-name {
    height: calc(var(--base-size) * 3);
    padding: 0 var(--space-sm);
}

.setup-number {
    height: 100%;
    width: var(--size-setup-number);
}

.member-name .text,
.setup-number .text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;

    text-align: center;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family-tech-ui);
    color: var(--team-color);
    z-index: 11;
}

.member-name .text {
    width: var(--size-lineup-cell);
}
</style>
