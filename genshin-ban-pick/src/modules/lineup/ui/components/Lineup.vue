<!-- src/modules/lineup/ui/components/Lineup.vue -->

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { createLogger } from '@/app/utils/logger';
import LineupBoard from './LineupBoard.vue'
import LineupPool from './LineupPool.vue'
import { getTeamTheme } from '@/modules/shared/ui/composables/getTeamTheme';
import { useTeamInfoStore } from '@/modules/team';
import { useLineupSync } from '../../sync/useLineupSync';

const teamInfoStore = useTeamInfoStore();
const { teamInfoPair } = storeToRefs(teamInfoStore);

const { fetchLineupImageMapState, lineupImagePlace, lineupImageRemove, myTeamSlot } = useLineupSync();

const logger = createLogger('lineup.ui.lineup');
const currentTeamSlot = ref<number>(myTeamSlot.value ?? teamInfoPair.value!.left.slot)

onMounted(async () => {
  if (myTeamSlot.value === undefined) return;
  fetchLineupImageMapState(myTeamSlot.value);
});

watch(myTeamSlot, (newSlot) => {
  if (newSlot === undefined) return
  fetchLineupImageMapState(newSlot);
});

function handleImageDrop({ teamSlot, cellId, imgId }: { teamSlot: number, cellId: number; imgId: string }) {
  logger.debug('image drop', { teamSlot, cellId, imgId });
  lineupImagePlace({ teamSlot, cellId, imgId });
}

function handleImageRestore({ teamSlot, cellId }: { teamSlot: number, cellId: number }) {
  logger.debug('image restore', { teamSlot, cellId });
  lineupImageRemove({ teamSlot, cellId });
}

</script>

<template>
  <div class="lineup">
    <div class="tabs">
      <button v-for="teamInfo in teamInfoPair" :key="teamInfo.slot" class="tab"
        :class="{ 'is-active': currentTeamSlot === teamInfo.slot }"
        :style="getTeamTheme(teamInfo.slot).themeVars" @click="currentTeamSlot = teamInfo.slot">
        {{ teamInfo.name }}
      </button>
    </div>

    <div class="content">
      <div class="section">
        <template v-if="teamInfoPair">
          <template v-if="currentTeamSlot === teamInfoPair.left.slot">
            <LineupPool :teamSlot="teamInfoPair.left.slot" />
            <LineupBoard :teamSlot="teamInfoPair.left.slot" :teamMembers="teamInfoPair.left.members"
              @image-drop="handleImageDrop" @image-restore="handleImageRestore" />
          </template>
          <template v-else>
            <LineupPool :teamSlot="teamInfoPair.right.slot" />
            <LineupBoard :teamSlot="teamInfoPair.right.slot" :teamMembers="teamInfoPair.right.members"
              @image-drop="handleImageDrop" @image-restore="handleImageRestore" />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lineup {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: var(--space-lg);
  gap: var(--space-lg);
}

.tabs {
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: var(--space-md);
}

.tab {
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

.tab:hover {
  background-color: color-mix(in srgb,
      var(--md-sys-color-surface-container-highest),
      white 6%);
}

.tab.is-active {
  background-color: var(--team-color);
  color: var(--team-on-color);
}

.tab.is-active:hover {
  background-color: var(--team-color-hover);
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}
</style>
