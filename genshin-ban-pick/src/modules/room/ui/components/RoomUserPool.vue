<!-- src/modules/room/ui/components/RoomUserPool.vue -->

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
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

const userToTeamSlotMap = computed(() => {
    const map: Record<string, number> = {};
    for (const [teamSlot, members] of Object.entries(teamMembersMap.value)) {
        Object.values(members).forEach(m => {
            if (m.type === 'Online')
                map[m.user.identityKey] = Number(teamSlot)
        });
    }
    return map;
});

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

function handleDragStartEvent(roomUser: IRoomUser, event: DragEvent) {
    console.debug(`[ROOM USER POOL] Handle drag start event`, roomUser.identityKey);
    event?.dataTransfer?.setData(DragTypes.ROOM_USER, roomUser.identityKey);
}

function getStyleForUser(roomUser: IRoomUser) {
    const teamSlot = userToTeamSlotMap.value[roomUser.identityKey];
    if (teamSlot === undefined) {
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
                @dragstart="handleDragStartEvent(roomUser, $event)"
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
