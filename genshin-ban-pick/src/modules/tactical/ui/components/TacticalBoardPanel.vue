<!-- src/modules/tactical/ui/components/TacticalBoardPanel.vue -->

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia';

import TacticalBoard from './TacticalBoard.vue'
import TacticalPool from './TacticalPool.vue'
import { useTeamTheme } from '@/modules/shared/ui/composables/useTeamTheme';
import { useTeamInfoStore } from '@/modules/team';
import { useTacticalBoardSync } from '../../sync/useTacticalBoardSync';

const teamInfoStore = useTeamInfoStore();
const { teamInfoPair } = storeToRefs(teamInfoStore);

const tacticalBoardSync = useTacticalBoardSync();
const { getUserTeamSlot, tacticalCellImagePlace, tacticalCellImageRemove } = tacticalBoardSync

const currentTeamSlot = ref<number>(getUserTeamSlot() ?? teamInfoPair.value!.left.slot)

function handleImageDrop({ teamSlot, cellId, imgId }: { teamSlot: number, cellId: number; imgId: string }) {
  console.debug(`[TATICAL BOARD PANEL] Handle image drop`, { teamSlot, cellId, imgId });
  tacticalCellImagePlace({ teamSlot, cellId, imgId });
}

function handleImageRestore({ teamSlot, cellId }: { teamSlot: number, cellId: number }) {
  console.debug(`[TATICAL BOARD PANEL] Handle image restore`, { teamSlot, cellId });
  tacticalCellImageRemove({ teamSlot, cellId });
}

</script>

<template>
  <div class="tactical__board-panel" :class="`tactical__board-panel--${currentTeamSlot}`">
    <div class="tactical__board-tabs">
      <button v-for="teamInfo in teamInfoPair" :key="teamInfo.slot" class="tactical__tab"
        :class="{ 'tactical__tab--active': currentTeamSlot === teamInfo.slot }"
        :style="useTeamTheme(teamInfo.slot).themeVars.value" @click="currentTeamSlot = teamInfo.slot">
        {{ teamInfo.name }}
      </button>
    </div>

    <div class="tactical__board-content">
      <div class="tactical__board-section">
        <template v-if="teamInfoPair">
          <template v-if="currentTeamSlot === teamInfoPair.left.slot">
            <TacticalPool :teamSlot="teamInfoPair.left.slot" />
            <TacticalBoard :teamSlot="teamInfoPair.left.slot" :teamMembers="teamInfoPair.left.members"
              @image-drop="handleImageDrop" @image-restore="handleImageRestore" />
          </template>
          <template v-else>
            <TacticalPool :teamSlot="teamInfoPair.right.slot" />
            <TacticalBoard :teamSlot="teamInfoPair.right.slot" :teamMembers="teamInfoPair.right.members"
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
  padding: var(--space-lg);
  gap: var(--space-lg);
}

.tactical__board-tabs {
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: var(--space-md);
}

.tactical__tab {
  flex: 1;
  padding: var(--space-md);
  color: var(--md-sys-color-on-surface);
  background-color: var(--md-sys-color-surface-container-highest);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-tech-title);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.tactical__tab:hover {
  background-color: color-mix(in srgb,
      var(--md-sys-color-surface-container-highest),
      white 6%);
}

.tactical__tab--active {
  background-color: var(--team-color);
  color: var(--team-on-color);
}

.tactical__tab--active:hover {
  background-color: var(--team-color-hover);
}

.tactical__board-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tactical__board-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
</style>
