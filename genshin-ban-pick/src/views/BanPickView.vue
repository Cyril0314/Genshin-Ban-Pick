<!-- src/views/BanPickView.vue -->

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import BanPickBoard from '@/features/BanPick/BanPickBoard.vue';
import Toolbar from '@/features/BanPick/components/ToolBar.vue';
import { useBoardSync } from '@/features/BanPick/composables/useBoardSync';
import { useRandomPull } from '@/features/BanPick/composables/useRandomPull';
import ImageOptions from '@/features/ImageOptions/ImageOptions.vue';
import { fetchCharacterMap } from '@/network/characterService';
import { fetchRoomSetting } from '@/network/roomService';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useBanPickStepStore } from '@/stores/banPickStepStore';
import { useBoardImageStore } from '@/stores/boardImageStore';
import { useTaticalBoardStore } from '@/stores/tacticalBoardStore';
import { ZoneType } from '@/types/IZone';
import { useRoomUsers } from '@/features/RoomUserPool/composables/useRoomUsers';

import type { IRoomSetting } from '@/types/IRoomSetting';
import type { ICharacter } from '@/types/ICharacter';
import { storeToRefs } from 'pinia';
const characterMap = shallowRef<Record<string, ICharacter> | null>(null);
const roomSetting = shallowRef<IRoomSetting | null>(null);

const filteredCharacterIds = ref<string[] | null>(null);

const { boardImageMap, usedImageIds, handleBoardImageDrop, handleBoardImageRestore, handleBoardImageReset, handleBanPickRecord } = useBoardSync();
const { randomPull } = useRandomPull();
const { joinRoom, leaveRoom } = useRoomUsers();

const boardImageStore = useBoardImageStore();

const teamInfoStore = useTeamInfoStore();
const { teamInfoPair } = storeToRefs(teamInfoStore)

const banPickStepStore = useBanPickStepStore();

const taticalBoardStore = useTaticalBoardStore()

onMounted(async () => {
    console.debug('[BAN PICK VIEW] On mounted');
    try {
        characterMap.value = await fetchCharacterMap();
        roomSetting.value = await fetchRoomSetting();
        filteredCharacterIds.value = Object.keys(characterMap.value).map((id) => id);
        boardImageStore.initZoneMetaTable(roomSetting.value.zoneMetaTable);
        teamInfoStore.initTeams(roomSetting.value.teams);
        banPickStepStore.initBanPickSteps(roomSetting.value.banPickSteps);
        taticalBoardStore.initTeamTaticalBoardMap(roomSetting.value.teams)
        const roomId = getRoomId();
        joinRoom(roomId);
    } catch (error) {
        console.error('[BAN PICK VIEW] Fetched character and room setting failed:', error);
    }
});

onBeforeRouteLeave(async (to, from) => {
    console.debug('[BAN PICK VIEW] On before route leave');
    const roomId = getRoomId();
    leaveRoom(roomId);
});

onUnmounted(() => {
    console.debug('[BAN PICK VIEW] On unmounted');
});

function getRoomId(): string {
    const roomId = new URLSearchParams(window.location.search).get('room') || 'default-room';
    console.debug('[BAN PICK VIEW] Get roomId', roomId);
    return roomId;
}

function handleFilterChange(newIds: string[]) {
    console.debug(`[BAN PICK VIEW] Handle filiter changed:`, newIds);
    filteredCharacterIds.value = newIds;
}

function handleRandomButtonClick({ zoneType }: { zoneType: ZoneType }) {
    console.debug(`[BAN PICK VIEW] Handle random pull`, { zoneType });
    if (!roomSetting.value || !filteredCharacterIds.value || filteredCharacterIds.value.length === 0) {
        console.warn(`[BAN PICK VIEW] Room is not ready or do not filiter any character`);
        return;
    }
    const result = randomPull(zoneType, roomSetting.value, boardImageMap.value, filteredCharacterIds.value);
    if (!result) {
        console.warn(`[BAN PICK VIEW] Random pull does not get any result`);
        return;
    }
    handleBoardImageDrop(result);
}
</script>

<template>
    <div>
        <div class="background-image"></div>
        <div class="background-overlay"></div>
        <div class="layout">
            <div class="layout__core">
                <ImageOptions v-if="characterMap" :characterMap="characterMap" :usedImageIds="usedImageIds"
                    :filteredCharacterIds="filteredCharacterIds" />
                <BanPickBoard v-if="roomSetting && characterMap && teamInfoPair" :roomSetting="roomSetting"
                    :characterMap="characterMap" :boardImageMap="boardImageMap" :teamInfoPair="teamInfoPair"
                    @image-drop="handleBoardImageDrop" @image-restore="handleBoardImageRestore"
                    @filter-change="handleFilterChange" @random-button-click="handleRandomButtonClick" />
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
