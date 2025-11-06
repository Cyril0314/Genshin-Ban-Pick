<!-- src/features/ChatRoom/ChatRoom.vue -->
<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useChatSync } from './composables/useChatSync.ts'
import { useAuthStore } from '@/stores/authStore.ts'

const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const { messages, sendMessage } = useChatSync()
const authStore = useAuthStore();
const { nickname } = storeToRefs(authStore);

watch(messages, (newMessages) => {
  scrollToBottom()
}, { deep: true })

function handleSend() {
  if (newMessage.value.trim()) {
    sendMessage(newMessage.value)
    newMessage.value = ''
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>

<template>
  <div class="chat__window">
    <div class="chat__header">
      <span id="current-nickname">用戶名稱: {{ nickname }} </span>
      <!-- <button @click="changeNickname">更改</button> -->
    </div>

    <div ref="messagesContainer" class="chat__messages">
      <div v-for="(msg, index) in messages" :key="index" class="chat__message"
        :class="[{ 'chat__message--self': msg.isSelf }]">
        <strong>{{ msg.isSelf ? '' : `${msg.nickname}:` }}</strong> {{ msg.message }}
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
  --size-chat-room: calc(var(--base-size) * 15);

  display: flex;
  flex-direction: column;
  width: var(--size-chat-room);
  height: 100%;
  gap: var(--space-md);
}

.chat__window button {
  border: none;
  border-radius: var(--border-radius-xs);
  padding: var(--space-sm);
  cursor: pointer;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-tech-ui);
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  flex-shrink: 0;
}

.chat__window button:hover {
  background-color: var(--md-sys-color-surface-tint);
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
  color: var(--md-sys-color-on-primary-container);
  flex: 1;
  min-width: 50px;
}

.chat__messages {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  overflow-y: auto;
  color: var(--md-sys-color-on-primary-container);
  padding: var(--space-sm) 0;
  gap: var(--space-xs);

  overflow-y: scroll;
  scrollbar-width: none;
}

.chat__message {
  max-width: 100%;
  word-break: break-all;
  overflow-wrap: break-word;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
  font-family: var(--font-family-sans);
  color: var(--md-sys-color-on-surface-variant);
}

.chat__message--self {
  text-align: end;
}

.chat__footer {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

#chat-input {
  height: 100%;
  padding: var(--space-sm);
  border-radius: var(--border-radius-xs);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
  font-family: var(--font-family-sans);
  flex: 1;
  background-color: var(--md-sys-color-surface-container-highest-alpha);
  color: var(--md-sys-color-on-surface);
  border: none;
  outline: none;
  /* 填滿剩餘空間 */
  /* 防止 overflow 溢出 */
}

#chat-input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

#chat-input:focus {
  outline: none;
}
</style>
