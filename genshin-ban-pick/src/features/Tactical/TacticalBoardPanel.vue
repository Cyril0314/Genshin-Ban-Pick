<script setup lang="ts">
import { ref } from 'vue'
import TacticalBoard from './TacticalBoard.vue'
import TacticalPool from './TacticalPool.vue'

const currentTeam = ref<'aether' | 'lumine'>('aether')
</script>

<template>
  <div class="tactical__board" :class="`tactical__board--${currentTeam}`">
    <div class="tactical__board-tabs">
      <button
        :class="['tactical__tab', { 'tactical__tab--active': currentTeam === 'aether' }]"
        @click="currentTeam = 'aether'"
      >
        Aether 隊
      </button>
      <button
        :class="['tactical__tab', { 'tactical__tab--active': currentTeam === 'lumine' }]"
        @click="currentTeam = 'lumine'"
      >
        Lumine 隊
      </button>
    </div>

    <div class="tactical__board-content">
      <div class="tactical__board-section">
        <!-- <TacticalPool :team="currentTeam" />
        <TacticalBoard :team="currentTeam" /> -->
        <template v-if="currentTeam === 'aether'">
          <TacticalPool team="aether" />
          <TacticalBoard team="aether" />
        </template>
        <template v-else>
          <TacticalPool team="lumine" />
          <TacticalBoard team="lumine" />
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

.tactical__board--aether {
  --team-tab-color: var(--md-sys-color-on-secondary-container);
  --team-tab-active-bg: var(--md-sys-color-secondary-container);
  --team-tab-hover-bg: var(--md-sys-color-secondary);
}
.tactical__board--lumine {
  --team-tab-active-color: var(--md-sys-color-on-tertiary-container);
  --team-tab-active-bg: var(--md-sys-color-tertiary-container);
  --team-tab-hover-bg: var(--md-sys-color-tertiary);
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
  background: var(--team-tab-hover-bg);
}

.tactical__tab--active {
  background: var(--team-tab-active-bg);
  color: var(--team-tab-active-color);
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
