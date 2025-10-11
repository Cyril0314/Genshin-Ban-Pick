<!-- src/features/Tactical/TacticalBoardPanel.vue -->

<script setup lang="ts">
import { ref } from 'vue'
import TacticalBoard from './TacticalBoard.vue'
import TacticalPool from './TacticalPool.vue'
import { useTeamInfoStore } from '@/stores/teamInfoStore'
import { useTeamTheme } from '@/composables/useTeamTheme';

const { teamInfoPair } = useTeamInfoStore()

const currentTeamId = ref<number>(teamInfoPair?.left.id ?? 0)

</script>

<template>
  <div class="tactical__board" :class="`tactical__board--${currentTeamId}`">
    <div class="tactical__board-tabs">
      <button v-for="team in teamInfoPair" :key="team.id" class="tactical__tab"
        :class="{ 'tactical__tab--active': currentTeamId === team.id }" :style="useTeamTheme(team.id).themeVars.value"
        @click="currentTeamId = team.id">
        {{ team.name }}
      </button>
    </div>

    <div class="tactical__board-content">
      <div class="tactical__board-section">
        <template v-if="teamInfoPair">
          <template v-if="currentTeamId === teamInfoPair.left.id">
            <TacticalPool :teamId="teamInfoPair.left.id" />
            <TacticalBoard :teamId="teamInfoPair.left.id" />
          </template>
          <template v-else>
            <TacticalPool :teamId="teamInfoPair.right.id" />
            <TacticalBoard :teamId="teamInfoPair.right.id" />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tactical__board {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: var(--space-sm);
  gap: var(--space-sm);
  border-radius: var(--border-radius-xs);
  background-color: var(--md-sys-color-surface-container-low-alpha);
  backdrop-filter: var(--backdrop-filter);
  box-shadow: var(--box-shadow);
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
  font-size: var(--font-size-sm);
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
