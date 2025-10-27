<!-- src/features/Team/TeamInfo.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue';

import { useTeamTheme } from '@/composables/useTeamTheme';
import { DragTypes } from '@/constants/customMIMETypes';
import type { IRoomUser } from '@/types/IRoomUser';
import type { TeamMember, TeamMembersMap } from '@/types/ITeam';

const props = defineProps<{
  side: 'left' | 'right';
  teamInfo: {
    id: number;
    name: string;
    members: TeamMember[];
  };
}>();

const emit = defineEmits<{
  (e: 'member-drop', payload: { identityKey: string; teamId: number }): void;
  (e: 'member-input', payload: { name: string; teamId: number }): void;
  (e: 'member-restore', payload: { member: TeamMember; teamId: number }): void;
}>();

const inputValue = ref('');

const { themeVars } = useTeamTheme(props.teamInfo.id);

function handleInput(e: Event) {
  console.debug(`[TEAM INFO] Handle input`);

  const name = inputValue.value.trim();
  if (!name) return;
  emit('member-input', { name, teamId: props.teamInfo.id });
  inputValue.value = '';
}

function handleRemoveMemberButtonClick(member: TeamMember) {
  console.debug('[TEAM INFO] Remove member button click', member);
  emit('member-restore', { member, teamId: props.teamInfo.id });
}

function handleDropEvent(event: DragEvent) {
  console.debug(`[TEAM INFO] Handle drop event`);
  event.preventDefault();
  // isOver.value = false
  const identityKey = event.dataTransfer?.getData(DragTypes.ROOM_USER);
  if (identityKey === undefined) return;
  emit('member-drop', { identityKey, teamId: props.teamInfo.id });
}
</script>

<template>
  <div class="team__info" :style="themeVars" :class="`team__info--${side}`">
    <span class="team__name" :class="`team__name--${side}`">
      {{ teamInfo.name }}
    </span>
    <div class="layout__team-members" :class="`layout__team-members--${side}`" @dragover.prevent
      @drop="handleDropEvent">
      <input class="team__member-input" type="text" :class="`team__member-input--${side}`" :placeholder="`輸入成員名稱`"
        v-model="inputValue" @keydown.enter.prevent="handleInput" @drop.prevent="() => { }" />
      <div class="layout__team-member-names">
        <div class="team-member" v-for="teamMember in props.teamInfo.members">
          <span class="team-member__name">{{ teamMember.type === 'manual' ? teamMember.name : teamMember.user.nickname
            }}</span>
          <button class="team-member__remove" @click="handleRemoveMemberButtonClick(teamMember)">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.team__info {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(var(--size-dropzone) * 9 / 16);
  border-radius: var(--border-radius-xs);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.team__info--right {
  flex-direction: row-reverse;
}

.team__name--left {
  --text-align: left;
}

.team__name--right {
  --text-align: right;
}

.team__name {
  display: flex;
  flex: 1;
  align-items: start;
  padding: var(--space-xs) var(--space-sm);
  text-align: var(--text-align);
  font-weight: var(--font-weight-heavy);
  font-size: var(--font-size-md);
  font-family: var(--font-family-tech-title);
  color: var(--team-on-bg);
  background-color: var(--team-bg);

  border-top-right-radius: var(--border-top-right-radius);
  border-top-left-radius: var(--border-top-left-radius);
  border-bottom-right-radius: var(--border-bottom-right-radius);
  border-bottom-left-radius: var(--border-bottom-left-radius);

  white-space: pre-line;
}

.layout__team-members {
  display: flex;
  flex-direction: column;
  flex: 3;
  background-color: var(--team-alpha);
  color: var(--md-sys-color-on-surface);
  min-height: calc(var(--font-size-sm) * var(--line-height-tightest) * 4 + var(--space-sm) * 2);
  height: auto;
  resize: none;
}

.team__member-input {
  width: 100%;
  flex: 1;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  border: none;
  resize: none;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-tightest);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-body);
  text-align: center;
}

.team__member-input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.team__member-input:focus {
  outline: none;
}

.layout__team-member-names {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-xs);
  flex: 2;
  width: 100%;
  padding: var(--space-xs);
  background-color: var(--md-sys-color-surface-container-alpha);
  backdrop-filter: var(--backdrop-filter);
  box-shadow: var(--box-shadow);
  overflow-y: auto;
  align-content: start;
}

.team-member {
  display: flex;
  background-color: var(--md-sys-color-surface-container-high-alpha);
  box-shadow: var(--box-shadow);
  line-height: calc(var(--size-room-user-height) / 2);
  height: calc(var(--size-room-user-height) / 2);
  border-radius: var(--border-radius-xs);
  gap: var(--space-xs);
  padding: 0 var(--space-xs);
  align-items: center;
  justify-content: space-between;
  color: var(--md-sys-color-on-surface-variant);
  overflow: hidden;
}

.team-member__name {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: start;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
}

.team-member__remove {
  opacity: 0;
  cursor: pointer;
  background: transparent;
  border: none;
  color: var(--team-bg);
  font-weight: bold;
  transition: opacity 0.15s ease;
  margin-left: var(--space-2xs);
}

.team-member:hover .team-member__remove {
  opacity: 1;
}
</style>
