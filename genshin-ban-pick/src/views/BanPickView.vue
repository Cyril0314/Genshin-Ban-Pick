<!-- src/views/BanPickView.vue -->

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, computed } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import StepIndicator from '@/features/BanPick/components/StepIndicator.vue';
import RoomUserPool from '@/features/RoomUserPool/RoomUserPool.vue';
import BanPickBoard from '@/features/BanPick/BanPickBoard.vue';
import Toolbar from '@/features/BanPick/components/ToolBar.vue';
import { useBoardSync } from '@/features/BanPick/composables/useBoardSync';
import { useRandomPull } from '@/features/BanPick/composables/useRandomPull';
import { fetchCharacterMap } from '@/network/characterService';
import { fetchRoomSetting } from '@/network/roomService';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useBanPickStepStore } from '@/stores/banPickStepStore';
import { useBoardImageStore } from '@/stores/boardImageStore';
import { useTaticalBoardStore } from '@/stores/tacticalBoardStore';
import { ZoneType } from '@/types/IZone';
import { useRoomUserSync } from '@/features/RoomUserPool/composables/useRoomUserSync';

import type { IRoomSetting } from '@/types/IRoomSetting';
import type { ICharacter } from '@/types/ICharacter';
import { storeToRefs } from 'pinia';
import { useTeamInfoSync } from '@/features/Team/composables/useTeamInfoSync';
const characterMap = shallowRef<Record<string, ICharacter> | null>(null);
const roomSetting = shallowRef<IRoomSetting | null>(null);

const filteredCharacterIds = ref<string[] | null>(null);

const { boardImageMap, usedImageIds, handleBoardImageDrop, handleBoardImageRestore, handleBoardImageMapReset, handleBoardRecord } = useBoardSync();
const { randomPull } = useRandomPull();
const { joinRoom, leaveRoom } = useRoomUserSync();
const { handleMemberInput, handleMemberDrop, handleMemberRestore } = useTeamInfoSync();

const boardImageStore = useBoardImageStore();

const teamInfoStore = useTeamInfoStore();
const { teamMembersMap, teams } = storeToRefs(teamInfoStore);

const banPickStepStore = useBanPickStepStore();

const taticalBoardStore = useTaticalBoardStore();

function adjustScale() {
    const wrapper = document.getElementsByClassName('viewport-wrapper')![0];
    const content = wrapper.querySelector('.viewport-content') as HTMLElement;
    const W = 1600;
    const H = 900;
    document.documentElement.style.setProperty('--layout-width', `${W}px`);
    document.documentElement.style.setProperty('--layout-height', `${H}px`);
    const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    content.style.transform = `scale(${scale})`;
}

onMounted(() => {
    adjustScale();
    window.addEventListener('resize', adjustScale);
});

onUnmounted(() => {
    window.removeEventListener('resize', adjustScale);
});

onMounted(async () => {
    console.debug('[BAN PICK VIEW] On mounted');
    try {
        characterMap.value = await fetchCharacterMap();
        roomSetting.value = await fetchRoomSetting();
        filteredCharacterIds.value = Object.keys(characterMap.value).map((id) => id);
        boardImageStore.initZoneMetaTable(roomSetting.value.zoneMetaTable);
        teamInfoStore.initTeams(roomSetting.value.teams);
        banPickStepStore.initBanPickSteps(roomSetting.value.banPickSteps);
        taticalBoardStore.initTeamTaticalBoardMap(roomSetting.value.teams, roomSetting.value.numberOfTeamSetup, roomSetting.value.numberOfSetupCharacter);
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

function handleRandomPull({ zoneType }: { zoneType: ZoneType }) {
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
    <div class="root__ban-pick-page scale-context">
        <div class="background-image"></div>
        <div class="background-overlay"></div>
        <div class="viewport-wrapper">
            <div class="viewport-content">
                <div class="layout">
                    <div class="layout__core">
                        <div class="layout__top">
                            <div class="layout__room-user-pool">
                                <RoomUserPool class="layout__room-user-pool"/>
                            </div>
                            <div class="layout__step-indicator">
                                <StepIndicator />
                            </div>
                            <div class="layout__toolbar">
                                <Toolbar @image-map-reset="handleBoardImageMapReset" @board-record="handleBoardRecord" />
                            </div>
                        </div>

                        <BanPickBoard
                            v-if="roomSetting && characterMap"
                            :roomSetting="roomSetting"
                            :characterMap="characterMap"
                            :boardImageMap="boardImageMap"
                            :usedImageIds="usedImageIds"
                            :filteredCharacterIds="filteredCharacterIds"
                            @image-drop="handleBoardImageDrop"
                            @image-restore="handleBoardImageRestore"
                            @filter-change="handleFilterChange"
                            @random-pull="handleRandomPull"
                            @member-input="handleMemberInput"
                            @member-drop="handleMemberDrop"
                            @member-restore="handleMemberRestore"
                        />
                        <div v-else class="loading">載入房間設定中...</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.root__ban-pick-page {
    --base-size: 20px;
    --size-top-bar: calc(var(--base-size) * 2.5);
    --size-drop-zone-width: calc(var(--base-size) * 7);
    --size-drop-zone-height: calc(var(--size-drop-zone-width) * 9 / 16);
    --size-ban-pick-common-space: var(--space-lg);
    --size-ban-row-spacer: calc(var(--size-drop-zone-item-space) * 2);
    --size-drop-zone-line-space: var(--space-lg);
    --size-drop-zone-item-space: var(--space-md);
    --size-step-indicator: calc(
        var(--size-drop-zone-width) * 2 + calc(var(--size-drop-zone-item-space) * 4)
    );
}

.background-image {
    position: absolute;
    z-index: -1000;
    background: url('@/assets/images/background/5.7.png') no-repeat center center;
    background-size: cover;
    width: 100%;
    height: 100vh;
}

.background-overlay {
    position: absolute;
    z-index: -999;
    width: 100%;
    height: 100vh;
    backdrop-filter: blur(8px);
}

.viewport-wrapper {
    width: 100vw;
    height: 100vh;
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 🎮 設定設計稿基準解析度（你可視覺上微調） */
.viewport-content {
    width: var(--layout-width);
    height: var(--layout-height);
    transform-origin: center center;
}

.layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: var(--space-sm);
    /* align-items: stretch; */
}

.layout__core {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-xl);
    flex: 1;
    min-height: 0;
}

.layout__top {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    width: 100%;
    height: var(--size-top-bar);
}

.layout__room-user-pool {
    display: flex;
    align-items: center;
    justify-content: start;
}

.layout__step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
}

.layout__toolbar {
    display: flex;
    align-items: center;
    justify-content: end;
}

</style>
