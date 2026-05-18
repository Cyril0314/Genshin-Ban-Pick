<!-- src/app/ui/components/ToolBar.vue -->

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { createLogger } from '@/app/utils/logger';
import ChatFloatWindow from '@/modules/chat/ui/components/ChatFloatWindow.vue';
import TacticalBoardPanelDrawer from '@/modules/tactical/ui/components/TacticalBoardPanelDrawer.vue';
import AnalysisDrawer from '@/modules/analysis/ui/components/AnalysisDrawer.vue';
import { useAuthStore } from '@/modules/auth';
import { useChatWindow } from '@/modules/chat/ui/composables/useChatWindow';

const emit = defineEmits<{
    (e: 'image-map-reset'): void;
    (e: 'match-save'): void;
}>();

const authStore = useAuthStore();
const { isAdmin } = storeToRefs(authStore);
const { isChatOpen, hasUnreadMessage } = useChatWindow()

const logger = createLogger('banPick.ui.toolbar');
const isTacticalDrawerOpen = ref(false);
const isAnalysisDrawerOpen = ref(false);

function handleTacticalButtonClickEvent() {
    logger.debug('tactical button click');
    isTacticalDrawerOpen.value = !isTacticalDrawerOpen.value;
}

function handleChatButtonClickEvent() {
    logger.debug('chat button click');
    isChatOpen.value = !isChatOpen.value;
}

function handleAnalysisButtonClickEvent() {
    logger.debug('analysis button click');
    isAnalysisDrawerOpen.value = !isAnalysisDrawerOpen.value;
}

function handleResetButtonClickEvent() {
    logger.debug('reset button click');
    emit('image-map-reset');
}

function handleSaveButtonClickEvent() {
    logger.debug('save button click');
    emit('match-save');
}
</script>

<template>
    <div class="toolbar">
        <button class="button button--tactical" @click="handleTacticalButtonClickEvent">編隊</button>
        <TacticalBoardPanelDrawer v-model:open="isTacticalDrawerOpen" />

        <div class="button-wrapper">
            <button class="button button--chat" @click="handleChatButtonClickEvent">聊天</button>
            <div v-if="hasUnreadMessage" class="notification-dot"></div>
        </div>
        <ChatFloatWindow v-model:open="isChatOpen" />

        <button class="button button--analysis" @click="handleAnalysisButtonClickEvent">報表</button>
        <AnalysisDrawer v-model:open="isAnalysisDrawerOpen" />

        <button v-if="isAdmin" class="button button--reset" @click="handleResetButtonClickEvent">重置</button>

        <button v-if="isAdmin" class="button button--save" @click="handleSaveButtonClickEvent">紀錄</button>
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

.button {
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

.button:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-surface-container-high), white 6%);
    transform: scale(1.05);
}

.button:active {
    transform: scale(0.98);
}

.button-wrapper {
    position: relative;
    display: inline-flex;
}

.notification-dot {
    --dot-size: calc(var(--base-size) * 0.75);
    position: absolute;
    top: calc(var(--dot-size) * -0.5);
    right: calc(var(--dot-size) * -0.5);
    width: calc(var(--dot-size));
    height: calc(var(--dot-size));
    background-color: var(--md-sys-color-error-container);
    border-radius: 50%;
    pointer-events: none;
    z-index: 1;
}
</style>
