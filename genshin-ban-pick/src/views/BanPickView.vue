<!-- src/views/BanPickView.vue -->

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router'

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
import { ZoneType } from '@/types/IZone';
import { useRoomUsers } from '@/features/RoomUserPool/composables/useRoomUsers';

import type { IRoomSetting } from '@/types/IRoomSetting';import type { ICharacter } from '@/types/ICharacter';
;

const characterMap = shallowRef<Record<string, ICharacter> | null>(null);
const roomSetting = shallowRef<IRoomSetting | null>(null);

const filteredCharacterIds = ref<string[] | null>(null)

const { boardImageMap, usedImageIds, handleBoardImageDrop, handleBoardImageRestore, handleBoardImageReset, handleBanPickRecord } = useBoardSync();
const { randomPull } = useRandomPull()
const { joinRoom, leaveRoom } = useRoomUsers()

onMounted(async () => {
    console.debug('[BAN PICK BOARD] On mounted')
    try {
        characterMap.value = await fetchCharacterMap();
        roomSetting.value = await fetchRoomSetting();
        filteredCharacterIds.value = Object.keys(characterMap.value).map((id) => id)
        const boardImageStore = useBoardImageStore()
        boardImageStore.initZoneMetaTable(roomSetting.value.zoneSchema.zoneMetaTable)
        const teamInfoStore = useTeamInfoStore();
        teamInfoStore.initTeams(roomSetting.value.teams);
        const banPickStepStore = useBanPickStepStore();
        banPickStepStore.initBanPickSteps(roomSetting.value.banPickSteps);
        const roomId = getRoomId();
        joinRoom(roomId)
    } catch (error) {
        console.error('[BAN PICK BOARD] Fetched character and room setting failed:', error);
    }
});

onBeforeRouteLeave(async (to, from) => {
    console.debug('[BAN PICK BOARD] On before route leave')
    const roomId = getRoomId();
    leaveRoom(roomId)
})

onUnmounted(() => {
    console.debug('[BAN PICK BOARD] On unmounted')
});

function getRoomId(): string {
    const roomId = new URLSearchParams(window.location.search).get('room') || 'default-room';
    console.debug('[BAN PICK BOARD] Get roomId', roomId)
    return roomId
}

function handleFilterChanged(newIds: string[]) {
    console.debug(`[BAN PICK BOARD] Handle filiter changed:`, newIds)
    filteredCharacterIds.value = newIds
}

function handleRandomPull({ zoneType }: { zoneType: ZoneType }) {
    console.debug(`[BAN PICK BOARD] Handle ${zoneType} random pull zoneType`)
    if (!roomSetting.value || !filteredCharacterIds.value || filteredCharacterIds.value.length === 0) {
        console.warn(`[BAN PICK BOARD] Room is not ready or do not filiter any character`)
        return;
    }
    const result = randomPull(zoneType, roomSetting.value, boardImageMap.value, filteredCharacterIds.value)
    if (!result) {
        console.warn(`[BAN PICK BOARD] Random pull does not get any result`)
        return
    } 
    handleBoardImageDrop(result)
}
</script>

<template>
    <div>
        <div class="background-image"></div>
        <div class="background-overlay"></div>
        <div class="layout">
            <div class="layout__core">
                <ImageOptions v-if="characterMap" :characterMap="characterMap" :usedImageIds="usedImageIds"
                    :filteredIds="filteredCharacterIds" />
                <BanPickBoard v-if="roomSetting&&characterMap" :roomSetting="roomSetting" :characterMap="characterMap"
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
