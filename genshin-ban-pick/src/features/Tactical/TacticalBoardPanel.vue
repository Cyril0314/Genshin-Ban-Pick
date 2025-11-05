<!-- src/features/Tactical/TacticalBoardPanel.vue -->

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia';

import TacticalBoard from './TacticalBoard.vue'
import TacticalPool from './TacticalPool.vue'
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useTeamTheme } from '@/composables/useTeamTheme';
import { useTacticalBoardSync } from './composables/useTacticalBoardSync';

const teamInfoStore = useTeamInfoStore();
const { teamInfoPair } = storeToRefs(teamInfoStore);

const tacticalBoardSync = useTacticalBoardSync();
const { userTeamId, handleTaticalCellImagePlace, handleTaticalCellImageRemove } = tacticalBoardSync

const currentTeamId = ref<number>( userTeamId.value ?? teamInfoPair.value!.left.id)

function handleImageDrop({ teamId, cellId, imgId }: { teamId: number, cellId: number; imgId: string }) {
  console.debug(`[TATICAL BOARD PANEL] Handle image drop`, { teamId, cellId, imgId });
  handleTaticalCellImagePlace({ teamId, cellId, imgId });
}

function handleImageRestore({ teamId, cellId }: { teamId: number, cellId: number }) {
  console.debug(`[TATICAL BOARD PANEL] Handle image restore`, { teamId, cellId });
  handleTaticalCellImageRemove({ teamId, cellId });
}

</script>

<template>
  <div class="tactical__board-panel" :class="`tactical__board-panel--${currentTeamId}`">
    <div class="tactical__board-tabs">
      <button v-for="teamInfo in teamInfoPair" :key="teamInfo.id" class="tactical__tab"
        :class="{ 'tactical__tab--active': currentTeamId === teamInfo.id }"
        :style="useTeamTheme(teamInfo.id).themeVars.value" @click="currentTeamId = teamInfo.id">
        {{ teamInfo.name }}
      </button>
    </div>

    <div class="tactical__board-content">
      <div class="tactical__board-section">
        <template v-if="teamInfoPair">
          <template v-if="currentTeamId === teamInfoPair.left.id">
            <TacticalPool :teamId="teamInfoPair.left.id" />
            <TacticalBoard :teamId="teamInfoPair.left.id" :teamMembers="teamInfoPair.left.members"
              @image-drop="handleImageDrop" @image-restore="handleImageRestore" />
          </template>
          <template v-else>
            <TacticalPool :teamId="teamInfoPair.right.id" />
            <TacticalBoard :teamId="teamInfoPair.right.id" :teamMembers="teamInfoPair.right.members"
              @image-drop="handleImageDrop" @image-restore="handleImageRestore" />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tactical__board-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: var(--space-md);
}

.tactical__board-tabs {
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: var(--space-sm);
}

.tactical__tab {
  flex: 1;
  padding: var(--space-sm);
  color: var(--md-sys-color-on-surface);
  background: var(--md-sys-color-surface-container-highest-alpha);
  border: none;
  border-radius: var(--border-radius-xs);
  cursor: pointer;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-tech-title);
  transition: background 0.3s ease;
}

.tactical__tab:hover {
  background: var(--team-hover);
}

.tactical__tab--active {
  background: var(--team-bg);
  color: var(--team-on-bg);
}

.tactical__board-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tactical__board-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
</style>
