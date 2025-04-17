<!-- src/features/ChatRoom/ChatRoom.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useChat } from './composables/useChat.ts'

const newMessage = ref('')
const { messages, nickname, sendMessage, changeNickname } = useChat()

function handleSend() {
    if (newMessage.value.trim()) {
        sendMessage(newMessage.value)
        newMessage.value = ''
    }
}
</script>

<template>
    <div class="chat__window">
        <div class="chat__header">
            <span id="current-nickname">暱稱: {{ nickname }}</span>
            <button @click="changeNickname">更改</button>
        </div>

        <div class="chat__messages">
            <div v-for="(msg, index) in messages" :key="index" class="chat__message">
                <strong>{{ msg.senderName }}:</strong> {{ msg.message }}
            </div>
        </div>

        <div class="chat__footer">
            <input v-model="newMessage" @keydown.enter="handleSend" type="text" placeholder="閉嘴！" id="chat-input" />
            <button @click="handleSend">傳送</button>
        </div>
    </div>
</template>

<style scoped>
.chat__window {
    display: flex;
    flex-direction: column;
    padding: 10px;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
    /* min-height: 200px; */
    /* max-height: 360px; */
}

.chat__window button {
    background: #6b5b5b;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 6px;
    cursor: pointer;
    font-size: 1.2em;
    width: 65px;
    flex-shrink: 0;
}

.chat__header {
    display: flex;
    gap: 10px;
    padding: 5px 0px;
    align-items: center;
}

#current-nickname {
    font-size: 1.2em;
    font-weight: bold;
    color: #4e4040;
    flex: 1;
    min-width: 50px;
}

.chat__messages {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    height: 300px;
    font-size: 1.2em;
    padding: 10px 0px;
}

.chat__message {
    max-width: 100%;
    word-break: break-all;
    overflow-wrap: break-word;
}

.chat__footer {
    display: flex;
    align-items: center;
    padding: 5px 0px;
    gap: 10px;
}

#chat-input {
    padding: 5px;
    border-radius: 6px;
    border: 1px solid #ccc;
    font-size: 1.2em;
    flex: 1;
    /* 填滿剩餘空間 */
    min-width: 50px;
    height: 40px;
    /* 防止 overflow 溢出 */
}

#chat-input:focus {
    outline: none;
}
</style>