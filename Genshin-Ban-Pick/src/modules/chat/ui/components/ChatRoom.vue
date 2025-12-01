<!-- src/modules/chat/ui/components/ChatRoom.vue -->
<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useAuthStore } from '@/modules/auth';
import { useRelativeTime } from '@/modules/shared/ui/composables/useRelativeTime';
import { useChatSync } from '../../sync/useChatSync.ts';
import { useChatStore } from '../../store/chatStore.ts';
import type { IChatMessage } from '@shared/contracts/chat/IChatMessage.ts';

const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);
const chatStore = useChatStore();
const { messages } = storeToRefs(chatStore)
const { sendMessage } = useChatSync();
const authStore = useAuthStore();
const { nickname, identityKey } = storeToRefs(authStore);

watch(
    messages,
    (newMessages) => {
        scrollToBottom();
    },
    { deep: true },
);

function handleSend() {
    if (newMessage.value.trim()) {
        sendMessage(newMessage.value);
        newMessage.value = '';
        scrollToBottom();
    }
}

function scrollToBottom() {
    nextTick(() => {
        if (messagesContainer.value) {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
    });
}

function isSelfMessage(msg: IChatMessage) {
    return msg.identityKey === identityKey.value
}

</script>

<template>
    <div class="chat__window">
        <div class="chat__header">
            <span id="current-nickname">用戶名稱: {{ nickname }} </span>
            <!-- <button @click="changeNickname">更改</button> -->
        </div>

        <div ref="messagesContainer" class="chat__messages">
            <div v-for="(msg, index) in messages" :key="index" class="message__container"
                :class="[{ 'message__container--self': isSelfMessage(msg) }]">
                <span v-if="!isSelfMessage(msg)" class = "message__name">{{ `${msg.nickname}:` }}</span> 
                <div class ="message"> {{ msg.message }} </div>
                <span class="message__time">{{ useRelativeTime(msg.timestamp ?? 0) }}</span>
            </div>
        </div>

        <div class="chat__footer">
            <input v-model="newMessage" @keydown.enter="handleSend" type="text" placeholder="輸入" id="chat-input" />
            <button @click="handleSend">傳送</button>
        </div>
    </div>
</template>

<style scoped>
.chat__window {
    --size-chat-room: calc(var(--base-size) * 16);

    display: flex;
    flex-direction: column;
    width: var(--size-chat-room);
    height: 100%;
    padding: var(--space-lg);
    gap: var(--space-md);
}

.chat__window button {
    border: none;
    border-radius: var(--radius-md);
    padding: var(--space-sm);
    cursor: pointer;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-tech-ui);
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
    flex-shrink: 0;
}

.chat__window button:hover {
    background-color: var(--primary-filled-hover);
    transform: scale(1.05);
}

.chat__header {
    display: flex;
    gap: var(--space-sm);
    align-items: center;
}

#current-nickname {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-sans);
    color: var(--md-sys-color-on-surface);
    flex: 1;
    min-width: 50px;
}

.chat__messages {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    overflow-y: auto;
    background-color: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-primary-container);
    border-radius: var(--radius-lg);
    
    gap: var(--space-sm);
    padding: var(--space-sm);

    overflow-y: scroll;
    scrollbar-width: none;
}

.message__container {
    display: flex;
    flex-direction: row;
    align-items: end;
    gap: var(--space-sm);
}

.message__container--self {
    flex-direction: row-reverse;
}

.message__name {
    align-self: center;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
    flex-shrink: 0;
}

.message {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-sans);
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-surface-container-highest);
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-sm);
    word-break: break-all;
    overflow-wrap: break-word;
}

.message__time {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-sans);
    color: var(--md-sys-color-neutral-60);
    flex-shrink: 0;
}

.chat__footer {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

#chat-input {
    height: 100%;
    padding: var(--space-sm);
    border-radius: var(--radius-xs);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-sans);
    flex: 1;
    background-color: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface);
    border: none;
    outline: 2px solid var(--md-sys-color-outline-variant);
    border-radius: var(--radius-md);
    /* 填滿剩餘空間 */
    /* 防止 overflow 溢出 */
}

#chat-input::placeholder {
    color: var(--md-sys-color-on-surface-variant);
}

#chat-input:focus {
    outline: 2px solid var(--md-sys-color-outline);
    border-radius: var(--radius-md);
}
</style>
