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

const memberNames = computed(() =>
    Array.from({ length: cols.value }, (_, i) => {
        const member = props.teamMembers[i];
        if (!member) return '';
        return member.type === 'Name' ? member.name : member.nickname;
    }),
);

const rowsData = computed(() =>
    Array.from({ length: rows.value }, (_, rowIndex) => ({
        setupNumber: String(rowIndex + 1),
        cells: Array.from({ length: cols.value }, (_, colIndex) => ({
            id: rowIndex * cols.value + colIndex,
        })),
    })),
);

const themeVars = computed(() => useTeamTheme(props.teamSlot).themeVars.value);

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
    <div class="lineup-board" :style="themeVars">
        <div class="member-names">
            <div v-for="(name, i) in memberNames" :key="i" class="member-name">
                <span class="text">{{ name }}</span>
            </div>
        </div>
        <div v-for="(rowData, i) in rowsData" :key="i" class="setup">
            <div class="setup-label">
                <span class="label-text">{{ rowData.setupNumber }}</span>
            </div>
            <div class="card-slots">
                <LineupCell
                    v-for="cell in rowData.cells"
                    :key="cell.id"
                    :cellId="cell.id"
                    :imageId="imageId(cell.id)"
                    :teamSlot="props.teamSlot"
                    @image-drop="handleImageDrop"
                    @image-restore="handleImageRestore"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.lineup-board {
    --size-setup-label: calc(var(--base-size) * 1);
    --size-lineup-cell: calc(var(--base-size) * 6);
    --border-width: 3px;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: var(--space-lg);
    background-color: var(--md-sys-color-surface-container-low);
    border-radius: var(--radius-lg);
}

/* indent to align with card-slots: card-padding + label + gap */
.member-names {
    display: flex;
    flex-direction: row;
    gap: var(--space-sm);
    padding-left: calc(var(--border-width) + var(--space-md) + var(--size-setup-label) + var(--space-sm));
    padding-right: var(--space-md);
}

.member-name {
    width: var(--size-lineup-cell);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.member-name .text {
    font-size: var(--font-size-sm);
    font-family: var(--font-family-tech-ui);
    font-weight: var(--font-weight-medium);
    color: var(--team-surface-high-tinted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
}

.setup {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    background-color: var(--md-sys-color-surface-container);
    border-radius: var(--radius-md);
    border-left: var(--border-width) solid var(--team-color);
}

.setup-label {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: var(--size-setup-label);
}

.label-text {
    font-size: var(--font-size-sm);
    font-family: var(--font-family-tech-ui);
    font-weight: var(--font-weight-bold);
    color: var(--team-surface-tinted);
    user-select: none;
}

.card-slots {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-sm);
}
</style>
