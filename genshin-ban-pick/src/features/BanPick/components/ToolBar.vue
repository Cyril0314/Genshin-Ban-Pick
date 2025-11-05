<!-- src/features/BanPick/components/Toolbar.vue -->

<script setup lang="ts">
import { ref } from 'vue';

import ChatRoomDrawer from '@/features/ChatRoom/ChatRoomDrawer.vue';
import TacticalBoardPanelDrawer from '@/features/Tactical/TacticalBoardPanelDrawer.vue';

import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';

const emit = defineEmits<{
    (e: 'image-map-reset'): void;
    (e: 'board-record'): void;
}>();

const authStore = useAuthStore()
const { isAdmin } = storeToRefs(authStore)
const isTaticalDrawerOpen = ref(false);
const isChatRoomDrawerOpen = ref(false);

function handleTaticalButtonClickEvent() {
    console.debug('[TOOL BAR] Handle tatical button click event');
    isTaticalDrawerOpen.value = !isTaticalDrawerOpen.value
}

function handleChatButtonClickEvent() {
    console.debug('[TOOL BAR] Handle chat button click event');
    isChatRoomDrawerOpen.value = !isChatRoomDrawerOpen.value
}

function handleResetButtonClickEvent() {
    console.debug('[TOOL BAR] Handle reset button click event');
    emit('image-map-reset');
}

function handleRecordButtonClickEvent() {
    console.debug('[TOOL BAR] Handle record button click event');
    emit('board-record');
}
</script>

<template>
    <div class="toolbar">
        <button class="toolbar__button toolbar__button--tatical" @click="handleTaticalButtonClickEvent">編隊</button>
        <TacticalBoardPanelDrawer v-model:open="isTaticalDrawerOpen"/>
        
        <button class="toolbar__button toolbar__button--chat" @click="handleChatButtonClickEvent">聊天</button>
        <ChatRoomDrawer v-model:open="isChatRoomDrawerOpen"/>

        <button v-if="isAdmin" class="toolbar__button toolbar__button--reset" @click="handleResetButtonClickEvent">重置</button>

        <button v-if="isAdmin" class="toolbar__button toolbar__button--record" @click="handleRecordButtonClickEvent">紀錄</button>
    </div>
</template>

<style scoped>
.toolbar {
    --size-tool-button: calc(var(--base-size) * 4);

    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: var(--space-lg);
}

.toolbar__button {
    width: var(--size-tool-button);
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border: none;
    border-radius: var(--border-radius-sm);
    padding: var(--space-sm) var(--space-sm);
    cursor: pointer;
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
    box-shadow: var(--box-shadow);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family-sans);
}

.toolbar__button:hover {
    background-color: var(--md-sys-color-primary-container);
    transform: scale(1.05);
}

.toolbar__button:active {
    transform: scale(0.98);
}
</style>
