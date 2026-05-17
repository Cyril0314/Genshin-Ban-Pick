<!-- src/features/Team/TeamInfo.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue';

import { useTeamTheme } from '@/modules/shared/ui/composables/useTeamTheme';
import { DragTypes } from '@/app/constants/customMIMETypes';
import { usePlayerHistory } from '@/modules/analysis/ui/composables/usePlayerHistory';
import { parseIdentity } from '@shared/contracts/player/identitySerialization';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

const playerHistory = usePlayerHistory();

function openPlayerHistory(memberSlot: number) {
    const m = props.teamInfo.members[memberSlot];
    if (!m) return;
    if (m.type === 'Online') {
        const identity = parseIdentity(m.user.identityKey);
        if (!identity) return;
        playerHistory.open(identity);
    } else {
        playerHistory.open({ type: 'Name', name: m.name });
    }
}

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
    (e: 'member-drop', payload: { identityKey: string; teamSlot: number; memberSlot: number }): void;
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
    return member.type === 'Manual' ? member.name : member.user.nickname
}

function handleInput(e: Event) {
    console.debug(`[TEAM INFO] Handle input`);
 
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
    console.debug('[TEAM INFO] Remove member button click', memberSlot);
    const member = getTeamMember(memberSlot)
    if (!member) return;
    emit('member-restore', { teamSlot: props.teamInfo.slot, memberSlot });
}

function handleDropEvent( memberSlot: number, event: DragEvent) {
    console.debug(`[TEAM INFO] Handle drop event`);
    event.preventDefault();
    // isOver.value = false
    const identityKey = event.dataTransfer?.getData(DragTypes.ROOM_USER);
    if (identityKey === undefined) return;
    emit('member-drop', { identityKey, teamSlot: props.teamInfo.slot, memberSlot });
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
                    <span class="name" @click="openPlayerHistory(memberSlot)">{{ getTeamMemberName(memberSlot) }}</span>
                    <button class="remove" @click="handleRemoveMemberButtonClick(memberSlot)">✕</button>
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
    /* background-color: var(--team-surface-tinted); */
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
    font-weight: bold;
    transition: opacity 0.15s ease;
    margin-left: var(--space-xs);
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
