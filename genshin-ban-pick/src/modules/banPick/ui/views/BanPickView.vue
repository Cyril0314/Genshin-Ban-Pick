<!-- src/app/ui/views/BanPickView.vue -->

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';

import Toolbar from '../components/ToolBar.vue';
import StepIndicator from '@/modules/board/ui/components/StepIndicator.vue';
import RoomUserPool from '@/modules/room/ui/components/RoomUserPool.vue';
import BanPickBoard from '@/modules/board/ui/components/BanPickBoard.vue';
import ChatFloating from '@/modules/chat/ui/components/ChatFloating.vue';

import { useViewportScale } from '../composables/useViewportScale';
import { useBanPickFacade } from '../composables/useBanPickFacade';

const route = useRoute();
const roomId = (route.query.room as string) || 'default-room';

useViewportScale()

const {
    state: {
        isInitLoading,
        roomSetting,
        characterMap,
        filteredCharacterKeys,
    },

    filter: {
        change: filterChange,
    },
    
    board: {
        imageMap,
        usedImageIds,
        imageDrop,
        imageRestore,
        imageMapReset,
        randomPull,
    },

    team: {
        memberInput,
        memberDrop,
        memberRestore,
    },

    match: {
        save: matchSave,
        isLoading: isMatchSaveLoading,
        result: matchResult,
        error: matchError
    },
} = useBanPickFacade(roomId)

watch(matchResult, (val) => {
    if (val) alert("儲存成功！");
});

watch(matchError, (err) => {
    if (err) alert("儲存失敗："+ err);
});

</script>

<template>
    <div class="root__ban-pick-page scale-context">
        <!-- <ChatFloating></ChatFloating> -->
        <div class="background-image"></div>
        <div class="background-overlay"></div>
        <div class="viewport-wrapper">
            <div class="viewport-content">
                <div class="layout">
                    <div class="layout__core">
                        <div class="layout__top">
                            <div class="layout__room-user-pool">
                                <RoomUserPool />
                            </div>
                            <div class="layout__step-indicator">
                                <StepIndicator />
                            </div>
                            <div class="layout__toolbar">
                                <Toolbar @image-map-reset="imageMapReset" @match-save="matchSave" />
                            </div>
                        </div>

                        <BanPickBoard v-if="!isInitLoading && roomSetting" 
                            :roomSetting="roomSetting"
                            :characterMap="characterMap" 
                            :boardImageMap="imageMap" 
                            :usedImageIds="usedImageIds"
                            :filteredCharacterKeys="filteredCharacterKeys" 
                            @image-drop="imageDrop"
                            @image-restore="imageRestore" 
                            @filter-change="filterChange"
                            @random-pull="randomPull" 
                            @member-input="memberInput"
                            @member-drop="memberDrop"
                            @member-restore="memberRestore" />
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

.background-image {
    z-index: 0;
}

.background-overlay {
    z-index: 1;
}

.viewport-wrapper {
    z-index: 2;
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
