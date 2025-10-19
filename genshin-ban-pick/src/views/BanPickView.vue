<!-- src/views/BanPickView.vue -->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router'

import { useFilteredCharacters } from '@/composables/useFilteredCharacters';
import BanPickBoard from '@/features/BanPick/BanPickBoard.vue';
import Toolbar from '@/features/BanPick/components/ToolBar.vue';
import { useBoardSync } from '@/features/BanPick/composables/useBoardSync';
import { handleUtilityRandom, handleBanRandom, handlePickRandom } from '@/features/BanPick/composables/useRandomizeImage';
import ImageOptions from '@/features/ImageOptions/ImageOptions.vue';
import { fetchCharacterMap } from '@/network/characterService';
import { fetchRoomSetting } from '@/network/roomService';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useBanPickStepStore } from '@/stores/banPickStepStore';
import { ZoneType } from '@/types/ZoneType';
import { useRoomUsers } from '@/features/RoomUserPool/composables/useRoomUsers';

import type { IRoomSetting } from '@/types/IRoomSetting';

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

const { boardImageMap, usedImageIds, handleBoardImageDrop, handleBoardImageRestore, handleBoardImageReset, handleBanPickRecord } = useBoardSync();
const filteredCharacterIds = useFilteredCharacters(characterMap, currentFilters);

const { joinRoom, leaveRoom } = useRoomUsers()

onMounted(async () => {
    console.log('[BanPickBoard] mounted')
    try {
        characterMap.value = await fetchCharacterMap();
        roomSetting.value = await fetchRoomSetting();
        const teamInfoStore = useTeamInfoStore();
        teamInfoStore.initTeams(roomSetting.value.teams);
        const banPickStepStore = useBanPickStepStore();
        banPickStepStore.initBanPickSteps(roomSetting.value.banPickSteps);
        const roomId = new URLSearchParams(window.location.search).get('room') || 'default-room';
        joinRoom(roomId)
    } catch (error) {
        console.error('[BanPickView] 無法載入角色和房間資料:', error);
    }
});

onBeforeRouteLeave(async (to, from) => {
    const roomId = new URLSearchParams(window.location.search).get('room') || 'default-room';
    leaveRoom(roomId)
})

onUnmounted(() => {

});

function handleFilterChanged(newFilters: Record<string, string[]>) {
    Object.assign(currentFilters.value, newFilters);
}

function handleRandomPull({ zoneType }: { zoneType: ZoneType }) {
    console.log('父元件收到隨機抽選按鈕點擊事件：', zoneType);
    if (!roomSetting.value || filteredCharacterIds.value.length === 0) {
        console.warn('無法進行隨機抽選：房間未就緒或無符合條件的角色');
        return;
    }

    const ctx = {
        roomSetting: roomSetting.value,
        filteredImageIds: filteredCharacterIds.value,
        boardImageMap: boardImageMap.value,
        handleBoardImageDrop,
    };
    switch (zoneType) {
        case ZoneType.UTILITY:
            handleUtilityRandom(ctx);
            return
        case ZoneType.BAN:
            handleBanRandom(ctx);
            return
        case ZoneType.PICK:
            handlePickRandom(ctx);
            return
    }
}
</script>

<template>
    <div>
        <div class="background-image"></div>
        <div class="background-overlay"></div>
        <div class="layout">
            <div class="layout__core">
                <ImageOptions :characterMap="characterMap" :usedImageIds="usedImageIds"
                    :filteredIds="filteredCharacterIds" />
                <BanPickBoard v-if="roomSetting" :roomSetting="roomSetting" :characterMap="characterMap"
                    :boardImageMap="boardImageMap" @image-drop="handleBoardImageDrop"
                    @image-restore="handleBoardImageRestore" @filter-changed="handleFilterChanged"
                    @pull="handleRandomPull" />
                <div v-else class="loading">載入房間設定中...</div>
            </div>
            <div class="layout__toolbar">
                <Toolbar @reset="handleBoardImageReset" @record="handleBanPickRecord" />
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
        /* ), */
        url('@/assets/images/background/5.7.png') no-repeat center center;
    background-size: cover;
}

.background-overlay {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -999;
    /* 疊在圖片上方 */
    width: 100vw;
    height: 100vh;
    /* background: linear-gradient(
    rgba(31, 31, 31, 0.5),
    rgba(127, 127, , 0.5)
  ); */
    backdrop-filter: blur(8px);
    /* 毛玻璃關鍵 */
}

.layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* grid-template-columns: 1fr auto 1fr; */
    gap: var(--space-sm);
    max-height: 100vh;
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
    /* 預設值，將內容元素撐開至 flexbox 大小 */
    justify-content: center;
    gap: var(--space-md);
}
</style>
