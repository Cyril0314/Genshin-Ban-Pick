<!-- src/modules/chat/ui/components/ChatFloatWindow.vue -->
 
<script setup lang="ts">

import { X } from '@lucide/vue';
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
        <div v-if="props.open" ref="windowRef" class="chat-float-window" :style="{ left: `${position.x}px`, top: `${position.y}px` }">
            <n-card
                class="card"
                content-style="padding: 0; display: flex; flex-direction: column; height: 100%; overflow: hidden;"
                :bordered="false"
                size="small"
                role="dialog"
                aria-modal="true"
            >
                <template #header>
                    <div class="header" @mousedown="handleMouseDown">
                        <span class="title">聊天室</span>
                    </div>
                </template>
                <template #header-extra>
                    <n-button text class="close-button" @click="emit('update:open', false)">
                        <template #icon>
                            <X/>
                        </template>
                    </n-button>
                </template>
                <ChatRoom />
            </n-card>
        </div>
    </transition>
</template>

<style scoped>
.chat-float-window {
    --window-height: calc(var(--base-size) * 25);

    position: fixed;
    z-index: 1000;
    height: var(--window-height);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.card {
    height: 100%;
    background-color: var(--md-sys-color-surface-container-highest);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
}

.header {
    cursor: move;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    user-select: none; /* Prevent text selection while dragging */
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
