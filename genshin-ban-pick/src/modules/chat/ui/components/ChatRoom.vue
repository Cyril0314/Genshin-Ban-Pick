<!-- src/modules/chat/ui/components/ChatRoom.vue -->

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useAuthStore } from '@/modules/auth';
import { useCurrentTime, formatRelativeTime } from '@/modules/shared/ui/composables/useRelativeTime';
import { useChatSync } from '../../sync/useChatSync.ts';
import { useChatStore } from '../../store/chatStore.ts';
import { usePlayerHistory } from '@/modules/analysis/ui/composables/usePlayerHistory';
import { isSameIdentity } from '@shared/contracts/auth/Identity';
import type { IChatMessage } from '@shared/contracts/chat/IChatMessage.ts';

const playerHistory = usePlayerHistory();

const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);
const chatStore = useChatStore();
const { messages } = storeToRefs(chatStore)
const { sendMessage } = useChatSync();
const authStore = useAuthStore();
const { nickname, identity } = storeToRefs(authStore);
const now = useCurrentTime();

onMounted(() => {
  scrollToBottom();
})

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
    return !!identity.value && isSameIdentity(msg.identity, identity.value);
}

function openPlayerHistory(msg: IChatMessage) {
    playerHistory.open(msg.identity);
}

</script>

<template>
    <div class="chat-room">
        <div ref="messagesContainer" class="messages">
            <div v-for="(msg, index) in messages" :key="index" class="message-row"
                :class="{ 'message-row--self': isSelfMessage(msg) }">
                <span v-if="!isSelfMessage(msg)" class="author" @click="openPlayerHistory(msg)">{{ `${msg.nickname}:` }}</span>
                <div class="bubble"> {{ msg.message }} </div>
                <span class="time">{{ formatRelativeTime(msg.timestamp ?? 0, now) }}</span>
            </div>
        </div>

        <div class="footer">
            <input class="input" v-model="newMessage" @keydown.enter="handleSend" type="text" placeholder="輸入" />
            <button class="send-button" @click="handleSend">傳送</button>
        </div>
    </div>
</template>

<style scoped>
.chat-room {
    --size-chat-room: calc(var(--base-size) * 18);

    display: flex;
    flex-direction: column;
    width: var(--size-chat-room);
    height: 100%;
    overflow: hidden;
    padding: var(--space-lg);
    gap: var(--space-md);
}

.messages {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    background-color: var(--md-sys-color-surface-container-low);
    color: var(--md-sys-color-on-primary-container);
    border-radius: var(--radius-lg);

    gap: var(--space-sm);
    padding: var(--space-sm);

    overflow-y: scroll;
    scrollbar-width: none;
}

.message-row {
    display: flex;
    flex-direction: row;
    align-items: end;
    gap: var(--space-sm);
}

.message-row--self {
    flex-direction: row-reverse;
}

.author {
    align-self: center;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
    flex-shrink: 0;
    cursor: pointer;
}

.author:hover {
    text-decoration: underline;
}

.bubble {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-sans);
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-surface-container-high);
    padding: var(--space-xs) var(--space-md);
    border-radius: var(--radius-sm);
    word-break: break-all;
    overflow-wrap: break-word;
}

.time {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-sans);
    color: var(--md-sys-color-neutral-60);
    flex-shrink: 0;
}

.footer {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.input {
    height: 100%;
    padding: var(--space-sm);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-sans);
    flex: 1;
    background-color: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    border: none;
    outline: 2px solid var(--md-sys-color-outline-variant);
    border-radius: var(--radius-md);
}

.input::placeholder {
    color: var(--md-sys-color-on-surface-variant);
}

.input:focus {
    outline: 2px solid var(--md-sys-color-outline);
}

.send-button {
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

.send-button:hover {
    background-color: var(--primary-filled-hover);
    transform: scale(1.05);
}
</style>
