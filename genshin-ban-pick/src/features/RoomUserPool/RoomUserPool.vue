<!-- src/features/RoomUserPool/RoomUserPool.vue -->

<script setup lang="ts">
import { DragTypes } from '@/constants/customMIMETypes.ts';
import { useRoomUsers } from './composables/useRoomUsers.ts';

const { roomUsers } = useRoomUsers();

function handleDragStartEvent(event: DragEvent, nickname: string) {
  console.log(`onDragStart ${nickname}`)
  event?.dataTransfer?.setData(DragTypes.RoomUser, nickname)
}
</script>

<template>
    <div class="container__users">
        <div class="container__user"
            v-for="roomUser in roomUsers"
            draggable="true"
            @dragstart="handleDragStartEvent($event, roomUser.nickname)">
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
    /* min-height: 200px; */
    /* max-height: 360px; */
}

.container__user {
    display: flex;
    background-color: var(--md-sys-color-surface-container-high-alpha);
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
    flex: 1; /* 撐滿可用寬度 */
    min-width: 0; /* 允許收縮 */
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface-variant);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

</style>