<!-- src/app/ui/views/BanPickView.vue -->

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { createLogger } from '@/app/utils/logger';
import Toolbar from '../components/ToolBar.vue';
import StepIndicator from '@/modules/board/ui/components/StepIndicator.vue';
import RoomUserPool from '@/modules/room/ui/components/RoomUserPool.vue';
import BanPickBoard from '@/modules/board/ui/components/BanPickBoard.vue';
import UserProfile from '@/modules/auth/ui/components/UserProfile.vue';
import PlayerHistoryModal from '@/modules/analysis/ui/components/PlayerHistoryModal.vue';

import { useViewportScale } from '../composables/useViewportScale';
import { useBanPickFacade } from '../composables/useBanPickFacade';
import { providePlayerHistory } from '@/modules/analysis/ui/composables/usePlayerHistory';

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

const route = useRoute();
const logger = createLogger('banPick.ui.view');
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
    if (val) {
        logger.info('match saved', val.id);
        alert('儲存成功！');
    }
});

watch(matchError, (err) => {
    if (err) {
        logger.error('match save error', err);
        alert('儲存失敗：' + err);
    }
});

const isPlayerHistoryOpen = ref(false);
const playerHistoryIdentity = ref<PlayerIdentity>();
providePlayerHistory({
    open(identity) {
        playerHistoryIdentity.value = identity;
        isPlayerHistoryOpen.value = true;
    },
});
</script>
<template>
    <div class="ban-pick-page scale-context">
        <div class="bg-image"></div>
        <div class="bg-overlay"></div>

        <div class="viewport-wrapper">
            <div class="viewport-content">
                <div class="layout">
                    <div class="core">
                        <div class="top-bar">
                            <div class="top-section top-section--align-left">
                                <UserProfile />
                                <div class="separator"></div>
                                <RoomUserPool />
                            </div>

                            <div class="indicator-slot">
                                <StepIndicator />
                            </div>

                            <div class="top-section top-section--align-right">
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

                        <div v-else class="loading">載入房間設定中...</div>
                    </div>
                </div>
            </div>
        </div>

        <PlayerHistoryModal v-model:open="isPlayerHistoryOpen" :identity="playerHistoryIdentity" />
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

/* Background */
.bg-image {
    position: absolute;
    background-color: var(--md-sys-color-background);
    background-size: cover;
    width: 100%;
    height: 100vh;
    z-index: 0;
}

.bg-overlay {
    position: absolute;
    width: 100%;
    height: 100vh;
    z-index: 1;
}

/* Viewport */
.viewport-wrapper {
    width: 100vw;
    height: 100vh;
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
}

.viewport-content {
    width: var(--layout-width);
    height: var(--layout-height);
    transform-origin: center center;
}

/* Layout */
.layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: var(--space-xl);
    background-color: var(--md-sys-color-surface-dim);
}

.core {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-xl);
    flex: 1;
    min-height: 0;
}

/* Top bar */
.top-bar {
    display: grid;
    grid-template-columns: 1fr var(--size-step-indicator) 1fr;
    background-color: var(--md-sys-color-surface-container-high);
    width: 100%;
    border-radius: var(--radius-lg);
    padding: var(--space-md) var(--space-lg);
    gap: var(--space-lg);
}

.top-section {
    display: flex;
    align-items: center;
    height: 100%;
}

/* top-section variants (permanent layout direction) */
.top-section--align-left {
    justify-content: start;
    gap: var(--space-md);
}

.top-section--align-right {
    justify-content: end;
}

.separator {
    width: 1px;
    height: 60%;
    background-color: var(--md-sys-color-outline-variant);
}

.indicator-slot {
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--md-sys-color-on-surface-variant);
}
</style>
