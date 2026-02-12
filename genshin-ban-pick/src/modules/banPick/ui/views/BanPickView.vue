<!-- src/app/ui/views/BanPickView.vue -->

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';

import Toolbar from '../components/ToolBar.vue';
import StepIndicator from '@/modules/board/ui/components/StepIndicator.vue';
import RoomUserPool from '@/modules/room/ui/components/RoomUserPool.vue';
import BanPickBoard from '@/modules/board/ui/components/BanPickBoard.vue';
import UserProfile from '@/modules/auth/ui/components/UserProfile.vue';

import { useViewportScale } from '../composables/useViewportScale';
import { useBanPickFacade } from '../composables/useBanPickFacade';

const route = useRoute();
const roomId = (route.query.room as string) || 'default-room';

useViewportScale();

const {
    state: { isInitLoading, roomSetting, characterMap, filteredCharacterKeys },

    filter: { change: filterChange },

    board: { imageMap, usedImageIds, imageDrop, imageRestore, imageMapReset, randomPull },

    team: { memberInput, memberDrop, memberRestore },

    match: { save: matchSave, isLoading: isMatchSaveLoading, result: matchResult, error: matchError },
} = useBanPickFacade(roomId);

watch(matchResult, (val) => {
    if (val) alert('儲存成功！');
});

watch(matchError, (err) => {
    if (err) alert('儲存失敗：' + err);
});
</script>
<template>
    <div class="ban-pick-page scale-context">
        <div class="ban-pick-page__bg-image"></div>
        <div class="ban-pick-page__bg-overlay"></div>

        <div class="ban-pick-page__viewport-wrapper">
            <div class="ban-pick-page__viewport-content">
                <div class="ban-pick-page__layout">
                    <div class="ban-pick-page__core">
                        <div class="ban-pick-page__top-bar">
                            <div class="ban-pick-page__top-section ban-pick-page__top-section--align-left">
                                <UserProfile />
                                <div class="ban-pick-page__separator"></div>
                                <RoomUserPool />
                            </div>

                            <div class="ban-pick-page__step-indicator">
                                <StepIndicator />
                            </div>

                            <div class="ban-pick-page__top-section ban-pick-page__top-section--align-right">
                                <Toolbar @image-map-reset="imageMapReset" @match-save="matchSave" />
                            </div>
                        </div>

                        <BanPickBoard
                            v-if="!isInitLoading && roomSetting"
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
                            @member-restore="memberRestore"
                        />

                        <div v-else class="ban-pick-page__loading">載入房間設定中...</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.ban-pick-page {
    --base-size: 20px;
    --size-top-bar: calc(var(--base-size) * 2.5);
    --size-drop-zone-width: calc(var(--base-size) * 7);
    --size-drop-zone-height: calc(var(--size-drop-zone-width) * 9 / 16);
    --size-drop-zone-space: var(--space-md);
    --size-step-indicator: calc(var(--size-drop-zone-width) * 2 + calc(var(--size-drop-zone-space) * 2));
    --size-team-info-height: calc(var(--size-drop-zone-height) + 2 * var(--size-drop-zone-space));
}

/* Background Elements */
.ban-pick-page__bg-image {
    position: absolute;
    background-color: var(--md-sys-color-background);
    background-size: cover;
    width: 100%;
    height: 100vh;
    z-index: 0;
}

.ban-pick-page__bg-overlay {
    position: absolute;
    width: 100%;
    height: 100vh;
    z-index: 1;
}

/* Viewport structure */
.ban-pick-page__viewport-wrapper {
    width: 100vw;
    height: 100vh;
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
}

.ban-pick-page__viewport-content {
    width: var(--layout-width);
    height: var(--layout-height);
    transform-origin: center center;
}

/* Core Layout */
.ban-pick-page__layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: var(--space-xl);
    background-color: var(--md-sys-color-surface-dim);
}

.ban-pick-page__core {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-xl);
    flex: 1;
    min-height: 0;
}

/* Top Bar & Grid System */
.ban-pick-page__top-bar {
    display: grid;
    grid-template-columns: 1fr var(--size-step-indicator) 1fr;
    background-color: var(--md-sys-color-surface-container-high);
    width: 100%;
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-lg);
    gap: var(--space-lg);
}

.ban-pick-page__top-section {
    display: flex;
    align-items: center;
    height: 100%;
}

/* Modifiers for Top Section */
.ban-pick-page__top-section--align-left {
    justify-content: start;
    gap: var(--space-md);
}

.ban-pick-page__top-section--align-right {
    justify-content: end;
}

.ban-pick-page__separator {
    width: 1px;
    height: 60%;
    background-color: var(--md-sys-color-outline-variant);
}

.ban-pick-page__step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
}

.ban-pick-page__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--md-sys-color-on-surface-variant);
}
</style>
