<!-- src/features/RoomUserPool/RoomUserPool.vue -->

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { DragTypes } from '@/constants/customMIMETypes.ts';
import { useRoomUserStore } from '@/stores/roomUserStore.ts';
import { useTeamInfoStore } from '@/stores/teamInfoStore.ts';
import { useTeamTheme } from '@/composables/useTeamTheme';

import type { IRoomUser } from '@/types/IRoomUser.ts';

const roomUserStore = useRoomUserStore();
const { roomUsers } = storeToRefs(roomUserStore)
const teamInfoStore = useTeamInfoStore();
const { teamMembersMap } = storeToRefs(teamInfoStore);

function handleDragStartEvent(event: DragEvent, roomUser: IRoomUser) {
    console.debug(`[ROOM USER POOL] Handle drag start event`, roomUser.identityKey);
    event?.dataTransfer?.setData(DragTypes.ROOM_USER, roomUser.identityKey)
}

function findUserTeamId(roomUser: IRoomUser): number | null {
    console.debug(`[ROOM USER POOL] Find user team id`, roomUser);
    for (const [teamId, members] of Object.entries(teamMembersMap.value)) {
        if (members.some(
            (m) => m.type === 'online' && m.user.identityKey === roomUser.identityKey
        )) {
            return Number(teamId);
        }
    }
    return null;
}

function getStyleForUser(roomUser: IRoomUser) {
    const teamId = findUserTeamId(roomUser);
    if (teamId === null) {
        return {
            '--team-bg': `var(--md-sys-color-surface-container-low-alpha)`, '--team-on-bg': `var(--md-sys-color-on-surface-variant)`
        };
    }
    const { themeVars } = useTeamTheme(teamId);
    return themeVars.value;
}

</script>

<template>
    <div class="container__users">
        <div class="container__user" v-for="roomUser in roomUsers" :key="roomUser.identityKey"
            :style="getStyleForUser(roomUser)" draggable="true" @dragstart="handleDragStartEvent($event, roomUser)">
            <span class="user__label">{{ roomUser.nickname }}</span>
        </div>
    </div>
</template>

<style scoped>
.container__users {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: var(--size-room-user-pool);
    padding: var(--space-sm);
    gap: var(--space-xs);
    border-radius: var(--border-radius-xs);
    background-color: var(--md-sys-color-surface-container-alpha);
    backdrop-filter: var(--backdrop-filter);
    box-shadow: var(--box-shadow);
    overflow-y: auto;
}

.container__user {
    display: flex;
    background: var(--team-bg);
    color: var(--team-on-bg);
    box-shadow: var(--box-shadow);
    height: var(--size-room-user-height);
    line-height: var(--size-room-user-height);
    border-radius: var(--border-radius-xs);
    min-width: calc(var(--size-room-user-width) / 2);
    max-width: var(--size-room-user-width);
    padding: 0 var(--space-xs);
    align-items: center;
    align-content: center;
    cursor: grab;
}

.user__label {
    flex: 1;
    min-width: 0;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--team-on-bg);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>