<!-- src/views/BanPickView.vue -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { onBeforeRouteLeave } from 'vue-router'
import { io, type Socket } from 'socket.io-client';
import ImageOptions from '@/features/ImageOptions/ImageOptions.vue';
import BanPickBoard from '@/features/BanPick/BanPickBoard.vue';
import Toolbar from '@/features/BanPick/components/ToolBar.vue';
import { fetchCharacterMap } from '@/network/characterService';
import { fetchRoomSetting } from '@/network/roomService';
import { useSocketStore } from '@/network/socket';
import { useBanPickImageSync } from '@/features/BanPick/composables/useBanPickImageSync';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { handleUtilityRandom, handleBanRandom, handlePickRandom } from '@/features/BanPick/composables/useRandomizeImage';
import { useFilteredCharacters } from '@/composables/useFilteredCharacters';
import type { IRoomSetting } from '@/types/IRoomSetting';

const socket = useSocketStore().getSocket();
const characterMap = ref({});
const roomSetting = ref<IRoomSetting | null>(null);
const currentFilters = ref({
    weapon: [],
    element: [],
    region: [],
    rarity: [],
    model_type: [],
    role: [],
    wish: [],
});

const { imageMap, usedImageIds, handleImageDropped, handleImageRestore, handleImageReset, handleBanPickRecord } = useBanPickImageSync(roomSetting);
const filteredCharacterIds = useFilteredCharacters(characterMap, currentFilters);

onMounted(async () => {
    try {
        characterMap.value = await fetchCharacterMap();
        roomSetting.value = await fetchRoomSetting();
        const teamInfoStore = useTeamInfoStore();
        teamInfoStore.initTeams(roomSetting.value.teams)
        const roomId = new URLSearchParams(window.location.search).get('room') || 'default-room';
        console.log(`[Client] join room ${roomId}`)
        socket.emit('room.user.join.request', roomId);
    } catch (error) {
        console.error('[BanPickView] 無法載入角色和房間資料:', error);
    }
});

onBeforeRouteLeave(async (to, from) => {
    const roomId = new URLSearchParams(window.location.search).get('room') || 'default-room';
    console.log(`[Client] leave room ${roomId}`)
    socket.emit('room.user.leave.request', roomId);
})

onUnmounted(() => {
    
});

function handleFilterChanged(newFilters: Record<string, string[]>) {
    Object.assign(currentFilters.value, newFilters);
}

function handleRandomPull({ zoneType }: { zoneType: 'utility' | 'ban' | 'pick' }) {
    console.log('父元件收到隨機抽選按鈕點擊事件：', zoneType);

    if (!roomSetting.value || filteredCharacterIds.value.length === 0) {
        console.warn('無法進行隨機抽選：房間未就緒或無符合條件的角色');
        return;
    }

    const ctx = {
        roomSetting: roomSetting.value,
        filteredImageIds: filteredCharacterIds.value,
        imageMap: imageMap.value,
        handleImageDropped,
    };
    if (zoneType === 'pick') {
        handlePickRandom(ctx);
    } else if (zoneType === 'ban') {
        handleBanRandom(ctx);
    } else if (zoneType === 'utility') {
        handleUtilityRandom(ctx);
    }
}
</script>

<template>
    <div>
        <div class="background-image"></div>
        <div class="background-overlay"></div>
        <div class="layout">
            <div class="layout__core">
                <ImageOptions :characterMap="characterMap" :usedImageIds="usedImageIds" :filteredIds="filteredCharacterIds" />
                <BanPickBoard
                    v-if="roomSetting"
                    :roomSetting="roomSetting"
                    :characterMap="characterMap"
                    :imageMap="imageMap"
                    @image-drop="handleImageDropped"
                    @image-restore="handleImageRestore"
                    @filter-changed="handleFilterChanged"
                    @pull="handleRandomPull"
                />
                <div v-else class="loading">載入房間設定中...</div>
            </div>
            <div class="layout__toolbar">
                <Toolbar @reset="handleImageReset" @record="handleBanPickRecord" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.background-image {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1000;
    width: 100vw;
    height: 100vh;
    background:
    /* linear-gradient( */
      /* var(--md-sys-color-surface-container-lowest-alpha), */
      /* var(--md-sys-color-surface-container-lowest-alpha), */
      /* rgba(124, 124, 124, 0.9),
      rgba(55, 55, 55, 0.5) */
    /* ), */ url('@/assets/images/background/5.7.png')
        no-repeat center center;
    background-size: cover;
}

.background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -999; /* 疊在圖片上方 */
    width: 100vw;
    height: 100vh;
    /* background: linear-gradient(
    rgba(31, 31, 31, 0.5),
    rgba(127, 127, , 0.5)
  ); */
    backdrop-filter: blur(8px); /* 毛玻璃關鍵 */
}

.layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* grid-template-columns: 1fr auto 1fr; */
    gap: var(--space-sm);
    min-height: 100vh;
    padding: var(--space-sm);
}

.layout__toolbar {
    display: flex;
    justify-content: center;
}

.layout__core {
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: var(--space-md);
}
</style>
