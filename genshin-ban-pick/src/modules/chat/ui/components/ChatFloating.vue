<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import ChatRoom from './ChatRoom.vue';
import { NCard } from 'naive-ui';

// --- Chat popout 開關 ---
const showWindow = ref(false);

// --- Popout window 的位置狀態 ---
const pos = reactive({
    x: window.innerWidth - 360 - 24, // 初始位置：右下
    y: window.innerHeight - 480 - 96,
});

// --- 拖曳狀態 ---
let dragging = false;
let offsetX = 0;
let offsetY = 0;
const windowRef = ref<HTMLElement | null>(null);

// --- 點擊氣泡切換聊天窗 ---
function toggleChat() {
    showWindow.value = !showWindow.value;
}

/* --- 開始拖曳 --- */
function onMouseDown(e: MouseEvent) {
    dragging = true;
    const win = windowRef.value!;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
}

/* --- 拖曳中 --- */
function onMouseMove(e: MouseEvent) {
    if (!dragging) return;

    pos.x = e.clientX - offsetX;
    pos.y = e.clientY - offsetY;

    // 限制範圍不讓它跑出畫面
    pos.x = Math.max(0, Math.min(pos.x, window.innerWidth - 300));
    pos.y = Math.max(0, Math.min(pos.y, window.innerHeight - 200));
}

/* --- 拖曳結束 --- */
function onMouseUp() {
    dragging = false;
}

onMounted(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});
onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
});
</script>

<template>
    <!-- 右下角聊天氣泡 -->
    <div id="chat-bubble" class="chat-bubble" @click.stop="toggleChat">
        <span class="bubble-icon">💬</span>
    </div>

    <!-- Messenger Popout Chat Window -->
    <transition name="chat-fade">
        <div v-if="showWindow" ref="windowRef" class="chat-popout" :style="{ left: pos.x + 'px', top: pos.y + 'px' }">
            <n-card size="small" class="chat-card">
                <!-- Header 可拖曳 -->
                <template #header>
                    <div class="chat-header" @mousedown="onMouseDown">
                        <span class="chat-title">聊天室</span>
                        <button class="close-btn" @click="showWindow = false">✕</button>
                    </div>
                </template>

                <!-- 內容 -->
                <ChatRoom />
            </n-card>
        </div>
    </transition>
</template>

<style scoped>
/* --- 浮動聊天泡泡（固定） --- */
.chat-bubble {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: var(--md-sys-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    z-index: 9999;
    transition: transform 0.2s ease;
}

.chat-bubble:hover {
    transform: scale(1.08);
}

.bubble-icon {
    font-size: 26px;
}

/* --- Messenger popout window --- */
.chat-popout {
    position: fixed;
    width: 360px;
    height: 480px;
    z-index: 9998;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

/* Card 要填滿 popout */
.chat-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0;
}

/* --- Header: 按住即可拖曳 --- */
.chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: move;
    font-weight: bold;
    padding: 4px 8px;
    user-select: none;
}

.chat-title {
    padding-left: 4px;
}

.close-btn {
    border: none;
    background: none;
    font-size: 16px;
    cursor: pointer;
    padding: 0 6px;
    color: var(--md-sys-color-on-surface);
}

.close-btn:hover {
    opacity: 0.7;
}

/* --- Fade in/out animation --- */
.chat-fade-enter-from,
.chat-fade-leave-to {
    opacity: 0;
    transform: translateY(6px);
}

.chat-fade-enter-to,
.chat-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.chat-fade-enter-active,
.chat-fade-leave-active {
    transition: all 0.2s ease;
}
</style>
