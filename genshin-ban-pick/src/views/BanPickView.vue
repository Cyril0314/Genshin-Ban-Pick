<!-- src/views/BanPickView.vue -->

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, computed } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import StepIndicator from '@/features/StepIndicator/StepIndicator.vue';
import RoomUserPool from '@/features/RoomUserPool/RoomUserPool.vue';
import BanPickBoard from '@/features/BanPick/BanPickBoard.vue';
import Toolbar from '@/features/Toolbar/ToolBar.vue';
import { useBoardSync } from '@/features/BanPick/composables/useBoardSync';
import { useRandomPull } from '@/features/BanPick/composables/useRandomPull';
import { fetchCharacterMap } from '@/network/characterService';
import { fetchRoomSetting, postRoomSave } from '@/network/roomService';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useMatchStepStore } from '@/stores/matchStepStore';
import { useBoardImageStore } from '@/stores/boardImageStore';
import { useTacticalBoardStore } from '@/stores/tacticalBoardStore';
import { ZoneType } from '@/types/IZone';
import { useRoomUserSync } from '@/features/RoomUserPool/composables/useRoomUserSync';

import type { IRoomSetting } from '@/types/IRoomSetting';
import type { ICharacter } from '@/types/ICharacter';
import { useTeamInfoSync } from '@/features/Team/composables/useTeamInfoSync';
const characterMap = shallowRef<Record<string, ICharacter> | null>(null);
const roomSetting = shallowRef<IRoomSetting | null>(null);

const filteredCharacterKeys = ref<string[] | null>(null);

const { boardImageMap, usedImageIds, handleBoardImageDrop, handleBoardImageRestore, handleBoardImageMapReset } = useBoardSync();
const { randomPull } = useRandomPull();
const { joinRoom, leaveRoom } = useRoomUserSync();
const { handleMemberInput, handleMemberDrop, handleMemberRestore } = useTeamInfoSync();

const boardImageStore = useBoardImageStore();
const teamInfoStore = useTeamInfoStore();
const matchStepStore = useMatchStepStore();
const tacticalBoardStore = useTacticalBoardStore();

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
        filteredCharacterKeys.value = Object.keys(characterMap.value).map((id) => id);
        boardImageStore.initZoneMetaTable(roomSetting.value.zoneMetaTable);
        teamInfoStore.initTeams(roomSetting.value.teams);
        matchStepStore.initMatchSteps(roomSetting.value.matchFlow.steps);
        tacticalBoardStore.initTeamTacticalBoardMap(roomSetting.value.teams, roomSetting.value.numberOfTeamSetup, roomSetting.value.numberOfSetupCharacter);
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

function handleFilterChange(newKeys: string[]) {
    console.debug(`[BAN PICK VIEW] Handle filiter changed:`, newKeys);
    filteredCharacterKeys.value = newKeys;
}

function handleRandomPull({ zoneType }: { zoneType: ZoneType }) {
    console.debug(`[BAN PICK VIEW] Handle random pull`, { zoneType });
    if (!roomSetting.value || !filteredCharacterKeys.value || filteredCharacterKeys.value.length === 0) {
        console.warn(`[BAN PICK VIEW] Room is not ready or do not filiter any character`);
        return;
    }
    const result = randomPull(zoneType, roomSetting.value, boardImageMap.value, filteredCharacterKeys.value);
    if (!result) {
        console.warn(`[BAN PICK VIEW] Random pull does not get any result`);
        return;
    }
    handleBoardImageDrop(result);
}

async function handleBoardRecord() {
    const roomId = getRoomId();
    if (!roomSetting.value) return;
    await postRoomSave(roomId, roomSetting.value)
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
                            :filteredCharacterKeys="filteredCharacterKeys"
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
