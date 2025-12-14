<!-- src/modules/chat/ui/components/ChatFloatWindow.vue -->
 
<script setup lang="ts">

import ChatRoom from './ChatRoom.vue';
import { useDraggableWindow } from '../composables/useDraggableWindow';

const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();

const { position, handleMouseDown } = useDraggableWindow({});

</script>

<template>
    <transition name="chat-fade">
        <div v-if="props.open" ref="windowRef" class="chat-floating-window" :style="{ left: `${position.x}px`, top: `${position.y}px` }">
            <n-card
                class="chat-card"
                content-style="padding: 0; display: flex; flex-direction: column; height: 100%; overflow: hidden;"
                :bordered="false"
                size="small"
                role="dialog"
                aria-modal="true"
            >
                <template #header>
                    <div class="chat-header-area" @mousedown="handleMouseDown">
                        <span class="chat-header-title">聊天室</span>
                    </div>
                </template>
                <template #header-extra>
                    <n-button text class="close-button" @click="emit('update:open', false)">
                        <template #icon>
                            <n-icon size="20">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
                                    />
                                </svg>
                            </n-icon>
                        </template>
                    </n-button>
                </template>
                <ChatRoom />
            </n-card>
        </div>
    </transition>
</template>

<style scoped>
.chat-floating-window {
    --window-height: calc(var(--base-size) * 25);

    position: fixed;
    z-index: 1000;
    height: var(--window-height);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.chat-card {
    height: 100%;
    background-color: var(--md-sys-color-surface-container-highest);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
}

.chat-header-area {
    cursor: move;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    user-select: none; /* Prevent text selection while dragging */
}

.chat-header-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-sans);
    color: var(--md-sys-color-on-surface);
}

.close-button {
    color: var(--md-sys-color-on-surface-variant);
}

.close-button:hover {
    color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 40%, white 60%);
}

/* Transition effects */
.chat-fade-enter-active,
.chat-fade-leave-active {
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;
}

.chat-fade-enter-from,
.chat-fade-leave-to {
    opacity: 0;
    transform: translateY(var(--space-xl));
}
</style>
