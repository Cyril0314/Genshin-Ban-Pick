<!-- src/modules/room/ui/components/RoomUserPool.vue -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { DragTypes } from '@/app/constants/customMIMETypes.ts';
import { useTeamInfoStore } from '@/modules/team';
import { useTeamTheme } from '@/modules/shared/ui/composables/useTeamTheme.ts';
import { useRoomUserStore } from '../../store/roomUserStore';

import type { IRoomUser } from '../../types/IRoomUser.ts';

const roomUserStore = useRoomUserStore();
const { roomUsers } = storeToRefs(roomUserStore);
const teamInfoStore = useTeamInfoStore();
const { teamMembersMap } = storeToRefs(teamInfoStore);

const usersRef = ref<HTMLElement | null>(null);

onMounted(() => {
    const el = usersRef.value;
    if (!el) return;

    el.addEventListener(
        'wheel',
        (e) => {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
        },
        { passive: false },
    );
});

function handleDragStartEvent(event: DragEvent, roomUser: IRoomUser) {
    console.debug(`[ROOM USER POOL] Handle drag start event`, roomUser.identityKey);
    event?.dataTransfer?.setData(DragTypes.ROOM_USER, roomUser.identityKey);
}

function findUserTeamSlot(roomUser: IRoomUser): number | null {
    console.debug(`[ROOM USER POOL] Find user team slot`, roomUser);
    for (const [teamSlot, members] of Object.entries(teamMembersMap.value)) {
        const memberValues = Object.values(members);
        if (memberValues.some((m) => m.type === 'Online' && m.user.identityKey === roomUser.identityKey)) {
            return Number(teamSlot);
        }
    }
    return null;
}

function getStyleForUser(roomUser: IRoomUser) {
    const teamSlot = findUserTeamSlot(roomUser);
    if (teamSlot === null) {
        return {
            '--team-color-bg': `var(--md-sys-color-surface-container-high)`,
            '--team-on-color-bg': `var(--md-sys-color-on-surface-variant)`,
        };
    }
    const { themeVars } = useTeamTheme(teamSlot);
    return themeVars.value;
}
</script>

<template>
    <div class="container__users" ref="usersRef">
        <transition-group name="user__fade-slide" tag="div" class="users__inner">
            <div
                class="container__user"
                v-for="roomUser in roomUsers"
                :key="roomUser.identityKey"
                :style="getStyleForUser(roomUser)"
                draggable="true"
                @dragstart="handleDragStartEvent($event, roomUser)"
            >
                <span class="user__label">{{ roomUser.nickname }}</span>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
.container__users {
    --size-room-user-height: calc(var(--base-size) * 1.5);
    --size-room-user-width: calc(var(--base-size) * 6);

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    width: 100%;
    padding: var(--space-md);
    border-radius: var(--radius-sm);
    background-color: var(--md-sys-color-surface-container);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
}

.container__user {
    display: inline-flex;
    background-color: var(--team-color-bg);
    color: var(--team-on-color-bg);
    height: var(--size-room-user-height);
    border-radius: var(--radius-sm);
    width: fit-content;
    max-width: none;
    align-items: center;
    align-content: center;
    cursor: grab;
}

.user__label {
    flex: 1;
    white-space: nowrap;
    overflow: visible;
    text-overflow: clip;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family-sans);
    padding: 0 var(--space-sm);
    color: var(--team-on-color-bg);
    text-align: center;
}

/* 過場容器避免造成 layout 問題 */
.users__inner {
    display: flex;
    gap: var(--space-md);
}

/* 進場前狀態 */
.user__fade-slide-enter-from {
    opacity: 0;
    transform: translatex(-16px);
}

/* 進場後狀態 */
.user__fade-slide-enter-to {
    opacity: 1;
    transform: translatex(0);
}

/* 動畫過渡 */
.user__fade-slide-enter-active {
    transition:
        opacity 0.25s ease-out,
        transform 0.25s ease-out;
}
</style>
