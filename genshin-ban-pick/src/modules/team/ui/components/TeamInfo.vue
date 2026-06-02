<!-- src/features/Team/TeamInfo.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue';
import { X } from '@lucide/vue';

import { createLogger } from '@/app/utils/logger';
import { useTeamTheme } from '@/modules/shared/ui/composables/useTeamTheme';
import { DragTypes } from '@/app/constants/customMIMETypes';
import { usePlayerHistory } from '@/modules/shared/ui/composables/usePlayerHistory';
import { parsePlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { Identity } from '@shared/contracts/identity/Identity';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

const logger = createLogger('team.ui.info');
const playerHistory = usePlayerHistory();

const props = defineProps<{
    side: 'left' | 'right';
    teamInfo: {
        slot: number;
        name: string;
        members: Record<number, TeamMember>;
    };
    numberOfSetupCharacter: number;
}>();

const emit = defineEmits<{
    (e: 'member-drop', payload: { identity: Identity; teamSlot: number; memberSlot: number }): void;
    (e: 'member-input', payload: { name: string; teamSlot: number; memberSlot: number }): void;
    (e: 'member-restore', payload: { teamSlot: number; memberSlot: number }): void;
}>();

const numberOfReservedSlot = 1
const inputValue = ref('');
const { themeVars } = useTeamTheme(props.teamInfo.slot);

const totalSlots = computed(() => 
  Array.from({ length: props.numberOfSetupCharacter + numberOfReservedSlot })
)

function getTeamMember(memberSlot: number): TeamMember | undefined {
    return props.teamInfo.members[memberSlot] ?? undefined
}

function getTeamMemberName(memberSlot: number): string | undefined {
    const member = getTeamMember(memberSlot)
    if (!member) return undefined;
    return member.type === 'Name' ? member.name : member.nickname
}

function handleInput(e: Event) {
    logger.debug('input');
 
    const name = inputValue.value.trim();
    if (!name) return;
    for (let i = 0; i < props.numberOfSetupCharacter; i++) {
        const member = getTeamMember(i);
        if (!member) {
            emit('member-input', { name, teamSlot: props.teamInfo.slot, memberSlot: i });
            inputValue.value = '';
            break;
        }
    }
}

function handleRemoveMemberButtonClick(memberSlot: number) {
    logger.debug('remove member click', memberSlot);
    const member = getTeamMember(memberSlot)
    if (!member) return;
    emit('member-restore', { teamSlot: props.teamInfo.slot, memberSlot });
}

function handleDropEvent( memberSlot: number, event: DragEvent) {
    logger.debug('drop', memberSlot);
    event.preventDefault();
    // isOver.value = false
    const identityStr = event.dataTransfer?.getData(DragTypes.ROOM_USER);
    if (!identityStr) return;
    const parsed = parsePlayerIdentity(identityStr);
    if (!parsed || parsed.type === 'Name') return;
    emit('member-drop', { identity: parsed, teamSlot: props.teamInfo.slot, memberSlot });
}


function handleMemberNameClick(memberSlot: number) {
    const m = props.teamInfo.members[memberSlot];
    if (!m) return;
    playerHistory.open(m);
}

</script>

<template>
    <div class="team-info" :style="themeVars" :class="`team-info--${side}`">
        <span class="title">
            {{ teamInfo.name }}
        </span>
        <div class="members-area">

            <div class="member-list">
                <div class="member"
                    v-for="(_, memberSlot) in totalSlots"
                    @dragover.prevent @drop="(e) => handleDropEvent(memberSlot, e)">
                    <span class="name" @click="handleMemberNameClick(memberSlot)">{{ getTeamMemberName(memberSlot) }}</span>
                    <X class="remove" @click="handleRemoveMemberButtonClick(memberSlot)"/>
                    
                </div>
                <input class="input" type="text"
                    :placeholder="`輸入成員名稱`" v-model="inputValue" @keydown.enter.prevent="handleInput"
                    @drop.prevent="() => { }" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.team-info {
    --size-team-member-height: calc(var(--base-size) * 1.85);

    display: flex;
    flex-direction: row;
    width: 100%;
    height: var(--size-team-info-height);
    border-radius: var(--radius-lg);
    outline: 2px solid var(--team-color);
    overflow: hidden;
}

.team-info--right {
    flex-direction: row-reverse;
}

.title {
    display: flex;
    flex: 1;
    align-items: center;
    padding: var(--space-xs) var(--space-sm);
    text-align: center;
    font-weight: var(--font-weight-heavy);
    font-size: var(--font-size-md);
    font-family: var(--font-family-tech-title);
    line-height: var(--line-height-loose);
    color: var(--team-on-color-bg);
    background-color: var(--team-color-bg);

    white-space: pre-line;
}

.members-area {
    display: flex;
    flex-direction: column;
    flex: 4;
    background-color: var(--md-sys-color-surface-container);
    resize: none;
}

.member-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
    padding: var(--space-sm);
    width: 100%;
    height: calc(var(--size-team-member-height) * 2 + var(--space-sm) * 2 + var(--space-md));
    overflow-y: scroll;
    scrollbar-width: none;
    align-content: start;
}

.input {
    width: 100%;
    background-color: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface);
    padding: var(--space-xs);
    border: none;
    border-radius: var(--radius-sm);
    resize: none;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-tightest);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-body);
    text-align: center;
}

.input::placeholder {
    color: var(--md-sys-color-on-surface-variant);
}

.input:focus {
    outline: none;
}

.member {
    display: flex;
    height: var(--size-team-member-height);
    gap: var(--space-xs);
    padding: 0 var(--space-sm);
    border-radius: var(--radius-sm);
    align-items: center;
    justify-content: space-between;
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-surface-container-highest);
    overflow: hidden;
}

.name {
    flex: 1;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    text-align: start;
    white-space: nowrap;
    text-overflow: ellipsis;
    min-width: 0;
    cursor: pointer;
}

.name:hover {
    text-decoration: underline;
}

.remove {
    opacity: 0;
    cursor: pointer;
    border: none;
    background: transparent;
    color: var(--team-color);
    padding: var(--space-xs);
    transition: opacity 0.15s ease;
}

.member:hover {
    background-color: color-mix(in srgb,
            var(--md-sys-color-surface-container-highest),
            white 6%);
}

.member:hover .remove {
    opacity: 1;
}
</style>
