<!-- src/modules/room/ui/components/RoomUserPool.vue -->

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { createLogger } from '@/app/utils/logger';
import { DragTypes } from '@/app/constants/customMIMETypes.ts';
import { useTeamTheme } from '@/modules/shared/ui/composables/useTeamTheme.ts';
import { useRoomUserStore } from '../../store/roomUserStore';
import { usePlayerHistory } from '@/modules/shared/ui/composables/usePlayerHistory';
import { stringifyPlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

import type { IRoomUser } from '@shared/contracts/room/IRoomUser';

const logger = createLogger('room.ui.userPool');
const playerHistory = usePlayerHistory();

const props = defineProps<{ userToTeamSlotMap: Record<string, number> }>();

const roomUserStore = useRoomUserStore();
const { roomUsers } = storeToRefs(roomUserStore);

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

function handleDragStartEvent(roomUser: IRoomUser, event: DragEvent) {
    logger.debug('drag start', roomUser.identity);
    event?.dataTransfer?.setData(DragTypes.ROOM_USER, stringifyPlayerIdentity(roomUser.identity));
}

function handleClick(roomUser: IRoomUser) {
    playerHistory.open(roomUser.identity);
}

function getStyleForUser(roomUser: IRoomUser) {
    const teamSlot = props.userToTeamSlotMap[stringifyPlayerIdentity(roomUser.identity)];
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
    <div class="room-user-pool" ref="usersRef">
        <transition-group name="fade-slide" tag="div" class="users">
            <div
                class="user"
                v-for="roomUser in roomUsers"
                :key="stringifyPlayerIdentity(roomUser.identity)"
                :style="getStyleForUser(roomUser)"
                draggable="true"
                @dragstart="handleDragStartEvent(roomUser, $event)"
                @click="handleClick(roomUser)"
            >
                <span class="label">{{ roomUser.nickname }}</span>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
.room-user-pool {
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

/* transition-group 的容器 */
.users {
    display: flex;
    gap: var(--space-md);
}

.user {
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

.label {
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

/* transition-group name="fade-slide" 對應的 vue transition classes */
.fade-slide-enter-from {
    opacity: 0;
    transform: translatex(-16px);
}

.fade-slide-enter-to {
    opacity: 1;
    transform: translatex(0);
}

.fade-slide-enter-active {
    transition:
        opacity 0.25s ease-out,
        transform 0.25s ease-out;
}
</style>
