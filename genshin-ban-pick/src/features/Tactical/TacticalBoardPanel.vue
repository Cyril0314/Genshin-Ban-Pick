<script setup lang="ts">
import { ref } from 'vue'
import TacticalBoard from './TacticalBoard.vue'
import TacticalPool from './TacticalPool.vue'

const currentTeam = ref<'aether' | 'lumine'>('aether')
</script>

<template>
  <div class="tactical__board">
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
  padding: 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  gap: 10px;
  backdrop-filter: blur(4px);
}

.tactical__board-tabs {
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 10px;
}

.tactical__tab {
  flex: 1;
  padding: 8px 16px;
  background: #ddd;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  transition: background 0.3s ease;
}

.tactical__tab:hover {
  background: #ccc;
}

.tactical__tab--active {
  background: #4e4040;
  color: #fff;
}

.tactical__board-content {
  display: flex;
  flex-direction: column;
}

.tactical__board-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
