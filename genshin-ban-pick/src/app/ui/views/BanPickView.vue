<!-- src/app/ui/views/BanPickView.vue -->

<script setup lang="ts">
import { ref, shallowRef, onMounted, onUnmounted, computed } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import Toolbar from '@/app/ui/components/ToolBar.vue';
import StepIndicator from '@/modules/board/ui/components/StepIndicator.vue';
import RoomUserPool from '@/modules/room/ui/components/RoomUserPool.vue';
import BanPickBoard from '@/modules/board/ui/components/BanPickBoard.vue';
import { roomUseCase, useRoomUserSync } from '@/modules/room';
import { characterUseCase, useCharacterStore } from '@/modules/character';
import { randomPullUseCase, useBoardSync, useBoardImageStore, useMatchStepStore, ZoneType } from '@/modules/board';
import { useTeamInfoSync, useTeamInfoStore } from '@/modules/team';
import { useTacticalBoardStore } from '@/modules/tactical';

import type { IRoomSetting } from '@/modules/room';
import type { CharacterFilterKey } from '@/modules/character';
import type { ICharacterRandomContext } from '@/modules/board';
import { boardUseCase } from '@/modules/board/application/boardUseCase';
import { tacticalUseCase } from '@/modules/tactical/application/tacticalUseCase';
import { matchStepUseCase } from '@/modules/board/application/matchStepUseCase';
import { teamUseCase } from '@/modules/team/application/teamUseCase';

const roomSetting = shallowRef<IRoomSetting | null>(null);

const filteredCharacterKeys = ref<string[]>([]);
const characterFilter = ref<Record<CharacterFilterKey, string[]>>({
    weapon: [],
    element: [],
    region: [],
    rarity: [],
    modelType: [],
    role: [],
    wish: [],
});
const route = useRoute();
const roomId = (route.query.room as string) || 'default-room';
const { fetchRoomSetting, saveRoom } = roomUseCase();

const { fetchCharacterMap } = characterUseCase();

const { initZoneMetaTable } = boardUseCase();

const { initTeams } = teamUseCase();

const { initTeamTacticalCellImageMap } = tacticalUseCase();

const { initMatchSteps } = matchStepUseCase();

const { boardImageDrop, boardImageRestore, boardImageMapReset } = useBoardSync();
const { randomPull } = randomPullUseCase();
const { joinRoom, leaveRoom } = useRoomUserSync();
const { memberInput, memberDrop, memberRestore } = useTeamInfoSync();

const boardImageStore = useBoardImageStore();
const { boardImageMap, usedImageIds } = storeToRefs(boardImageStore);

const characterStore = useCharacterStore();
const { characterMap } = storeToRefs(characterStore)

function adjustScale() {
    const wrapper = document.getElementsByClassName('viewport-wrapper')![0];
    const content = wrapper.querySelector('.viewport-content') as HTMLElement;
    // 1650 1000
    const W = 1650;
    const H = 1000;
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
        await fetchCharacterMap();
        roomSetting.value = await fetchRoomSetting(roomId);
        filteredCharacterKeys.value = Object.keys(characterMap.value).map((id) => id);
        if (roomSetting.value) {
            initZoneMetaTable(roomSetting.value.zoneMetaTable);
            initTeams(roomSetting.value.teams);
            initMatchSteps(roomSetting.value.matchFlow.steps);
            initTeamTacticalCellImageMap(
                roomSetting.value.teams,
                roomSetting.value.numberOfTeamSetup,
                roomSetting.value.numberOfSetupCharacter,
            );
        }

        joinRoom(roomId);
    } catch (error) {
        console.error('[BAN PICK VIEW] Fetched character and room setting failed:', error);
    }
});

onBeforeRouteLeave(async (to, from) => {
    console.debug('[BAN PICK VIEW] On before route leave');
    leaveRoom(roomId);
});

onUnmounted(() => {
    console.debug('[BAN PICK VIEW] On unmounted');
});

function handleFilterChange({
    filteredCharacterKeys: newKeys,
    characterFilter: newFilter,
}: {
    filteredCharacterKeys: string[];
    characterFilter: Record<CharacterFilterKey, string[]>;
}) {
    console.debug(`[BAN PICK VIEW] Handle filiter changed:`, { filteredCharacterKeys: newKeys, characterFilter: newFilter });
    filteredCharacterKeys.value = newKeys;
    characterFilter.value = newFilter;
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
    const randomContext: ICharacterRandomContext = { characterFilter: characterFilter.value };
    boardImageDrop({ ...result, randomContext });
}

async function handleBoardRecord() {
    await saveRoom(roomId);
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
                                <RoomUserPool class="layout__room-user-pool" />
                            </div>
                            <div class="layout__step-indicator">
                                <StepIndicator />
                            </div>
                            <div class="layout__toolbar">
                                <Toolbar @image-map-reset="boardImageMapReset" @board-record="handleBoardRecord" />
                            </div>
                        </div>

                        <BanPickBoard v-if="roomSetting && characterMap" :roomSetting="roomSetting"
                            :characterMap="characterMap" :boardImageMap="boardImageMap" :usedImageIds="usedImageIds"
                            :filteredCharacterKeys="filteredCharacterKeys" @image-drop="boardImageDrop"
                            @image-restore="boardImageRestore" @filter-change="handleFilterChange"
                            @random-pull="handleRandomPull" @member-input="memberInput"
                            @member-drop="memberDrop" @member-restore="memberRestore" />
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
    /* --size-ban-row-spacer: var(--size-drop-zone-space); */
    --size-drop-zone-space: var(--space-md);
    --size-step-indicator: calc(var(--size-drop-zone-width) * 2 + calc(var(--size-drop-zone-space) * 2));
    --size-team-info-height: calc(var(--size-drop-zone-height) + 2 * var(--size-drop-zone-space));
}

.background-image {
    position: absolute;
    z-index: -1000;
    /* background: url('@/assets/images/background/5.7.png') no-repeat center center; */
    /* background: url('@/assets/images/background/LunaI.webp') no-repeat center center; */
    /* filter: brightness(0.2) saturate(0.1); */
    background-color: var(--md-sys-color-background);
    background-size: cover;
    width: 100%;
    height: 100vh;
}

.background-overlay {
    position: absolute;
    z-index: -999;
    width: 100%;
    height: 100vh;
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
    padding: var(--space-xl);
    background-color: var(--md-sys-color-surface-dim);
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
    grid-template-columns: 1fr var(--size-step-indicator) 1fr;
    background-color: var(--md-sys-color-surface-container-high);
    width: 100%;
    /* height: var(--size-top-bar); */
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-lg);
    gap: var(--space-lg);
}

.layout__room-user-pool {
    display: flex;
    align-items: center;
    justify-content: start;
    height: 100%;
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
