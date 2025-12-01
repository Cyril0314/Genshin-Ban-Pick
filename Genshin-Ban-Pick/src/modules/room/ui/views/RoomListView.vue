<!-- src/modules/room/ui/views/RoomListView.vue -->

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import router from '@/router';

import { useRoomList } from '../composables/useRoomList';

const { isLoading, errorMessage, rooms, loadRooms } = useRoomList()

onMounted(async () => {
    loadRooms();
});

function enterRoom(roomId: string) {
    router.push({ name: 'BanPick', query: { room: roomId } });
}
</script>

<template>
    <div class="room-list__view scale-context">
        <div class="room-list__container">
            <h2 class="title">房間列表</h2>

            <!-- 載入狀態 -->
            <div v-if="isLoading" class="loading">
                <span>載入中...</span>
            </div>

            <!-- 錯誤訊息 -->
            <div v-else-if="errorMessage" class="error">
                {{ errorMessage }}
            </div>

            <!-- 無房間 -->
            <div v-else-if="Object.keys(rooms).length === 0" class="empty">目前沒有房間</div>

            <!-- 房間列表 -->
            <div v-else class="room-list">
                <div class="room-card" v-for="(room, roomId) in rooms" :key="roomId" @click="enterRoom(roomId)">
                    <div class="room-header">
                        <h3>{{ roomId }}</h3>
                    </div>

                    <div class="room-meta">
                        <div class="item">
                            <span class="label">玩家數</span>
                            <span>{{ room.users.length }}</span>
                        </div>

                        <div class="item">
                            <span class="label">Ban / Pick</span>
                            <span>{{ room.roomSetting.numberOfBan }} / {{ room.roomSetting.numberOfPick }}</span>
                        </div>

                        <div class="item">
                            <span class="label">自由位</span>
                            <span>{{ room.roomSetting.numberOfUtility }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 重新整理按鈕 -->
            <button class="refresh-button" @click="loadRooms">重新整理</button>
        </div>
    </div>
</template>

<style scoped>
.room-list__view {
    width: 100%;
    min-height: 100vh;
    padding: var(--space-xl);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background-color: var(--md-sys-color-background);
}

.room-list__container {
    width: 1200px;
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
}

.title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-on-surface);
}

.loading,
.error,
.empty {
    padding: var(--space-lg);
    text-align: center;
    color: var(--md-sys-color-on-surface-variant);
}

.room-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--space-lg);
}

.room-card {
    padding: var(--space-lg);
    background-color: var(--md-sys-color-surface-container);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}
.room-card:hover {
    background-color: var(--md-sys-color-surface-container-high);
    transform: translateY(-4px);
}

.room-header h3 {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-on-surface);
}

.room-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.room-meta .item {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
}

.refresh-button {
    width: 200px;
    padding: var(--space-sm);
    margin: 0 auto;
    border-radius: var(--radius-md);
    border: none;
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    transition: 0.2s ease;
}
.refresh-button:hover {
    background-color: var(--primary-filled-hover);
    transform: scale(1.03);
}
</style>
