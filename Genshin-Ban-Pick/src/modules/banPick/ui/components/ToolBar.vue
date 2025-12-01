<!-- src/app/ui/components/ToolBar.vue -->

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import ChatRoomDrawer from '@/modules/chat/ui/components/ChatRoomDrawer.vue';
import TacticalBoardPanelDrawer from '@/modules/tactical/ui/components/TacticalBoardPanelDrawer.vue';
import AnalysisDrawer from '@/modules/analysis/ui/components/AnalysisDrawer.vue';
import { useAuthStore } from '@/modules/auth';

const emit = defineEmits<{
    (e: 'image-map-reset'): void;
    (e: 'match-save'): void;
}>();

const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const isTacticalDrawerOpen = ref(false);
const isChatRoomDrawerOpen = ref(false);
const isAnalysisDrawerOpen = ref(false);

function handleTacticalButtonClickEvent() {
    console.debug('[TOOL BAR] Handle tactical button click event');
    isTacticalDrawerOpen.value = !isTacticalDrawerOpen.value;
}

function handleChatButtonClickEvent() {
    console.debug('[TOOL BAR] Handle chat button click event');
    isChatRoomDrawerOpen.value = !isChatRoomDrawerOpen.value;
}

function handleAnalysisButtonClickEvent() {
    console.debug('[TOOL BAR] Handle analysis button click event');
    isAnalysisDrawerOpen.value = !isAnalysisDrawerOpen.value;
}

function handleResetButtonClickEvent() {
    console.debug('[TOOL BAR] Handle reset button click event');
    emit('image-map-reset');
}

function handleSaveButtonClickEvent() {
    console.debug('[TOOL BAR] Handle save button click event');
    emit('match-save');
}
</script>

<template>
    <div class="toolbar">
        <button class="toolbar__button toolbar__button--tactical" @click="handleTacticalButtonClickEvent">編隊</button>
        <TacticalBoardPanelDrawer v-model:open="isTacticalDrawerOpen" />

        <button class="toolbar__button toolbar__button--chat" @click="handleChatButtonClickEvent">聊天</button>
        <ChatRoomDrawer v-model:open="isChatRoomDrawerOpen" />

        <button class="toolbar__button toolbar__button--analysis" @click="handleAnalysisButtonClickEvent">報表</button>
        <AnalysisDrawer v-model:open="isAnalysisDrawerOpen" />

        <button v-if="isAdmin" class="toolbar__button toolbar__button--reset"
            @click="handleResetButtonClickEvent">重置</button>

        <button v-if="isAdmin" class="toolbar__button toolbar__button--save"
            @click="handleSaveButtonClickEvent">紀錄</button>
    </div>
</template>

<style scoped>
.toolbar {
    --size-tool-button: calc(var(--base-size) * 4);

    display: flex;
    flex-direction: row;
    justify-content: center;
    background-color: var(--md-sys-color-surface-container);
    gap: var(--space-lg);
    padding: var(--space-md);
    border-radius: var(--radius-md);
}

.toolbar__button {
    width: var(--size-tool-button);
    background-color: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface);
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--space-sm) var(--space-sm);
    cursor: pointer;
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family-sans);
}

.toolbar__button:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-surface-container-high), white 6%);
    transform: scale(1.05);
}

.toolbar__button:active {
    transform: scale(0.98);
}
</style>
