<!-- src/features/Tactical/TacticalBoard.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import TacticalCell from './TacticalCell.vue'
import { useTacticalBoardSync } from './composables/useTacticalBoardSync'
import { useTeamInfoSync } from '@/features/Team/composables/useTeamInfoSync'

const rows = 4
const cols = 5
const props = defineProps<{ team: 'aether' | 'lumine' }>()

const { cellMap, handleCellDrop, handleCellClear } = useTacticalBoardSync(props.team)
const { teamInfoMap } = useTeamInfoSync()

const teamInfo = computed(() =>
  props.team === 'aether' ? teamInfoMap.value.aether : teamInfoMap.value.lumine,
)

const memberCells = computed(() => {
  // 如果成員不足 4 個，補空字串
  const members = teamInfo.value.members.split('\n')
  return Array.from({ length: 4 }, (_, i) => members[i] || '')
})

const boardCells = computed(() => {
  return Array.from({ length: rows * cols }, (_, i) => {
    // 將 i 轉換成 row 與 col（0-indexed）
    const row = Math.floor(i / cols)
    const col = i % cols
    return { row, col, zoneId: `cell-${i + 1}` }
  })
})
</script>

<template>
  <div class="tactical__grid">
    <div class="tactical__cell tactical__cell--header">
      <span class="tactical__header tactical__header--member">成員</span>
      <span class="tactical__header tactical__header--team-number">隊伍</span>
    </div>
    <div
      v-for="(member, index) in memberCells"
      :key="index"
      class="tactical__cell tactical__cell--member"
    >
      {{ member }}
    </div>
    <template v-for="cell in boardCells" :key="cell.zoneId">
      <div v-if="cell.col === 0" class="tactical__cell tactical__cell--team-number">
        {{ cell.row + 1 }}
      </div>
      <TacticalCell
        v-else
        :zoneId="cell.zoneId"
        :imageId="cellMap[cell.zoneId]"
        @drop="handleCellDrop"
        @clear="handleCellClear"
      />
    </template>
  </div>
</template>

<style scoped>
.tactical__grid {
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(5, var(--size-tactical-cell));
  grid-template-rows: repeat(5, var(--size-tactical-cell));
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--border-radius-xs);
  background-color: var(--md-sys-color-surface-container-alpha);
}

.tactical__cell--header {
  position: relative;
}

.tactical__cell--header::before {
  content: '';
  position: absolute;
  border-radius: var(--border-radius-xs);
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 利用 linear-gradient 將 cell 分成兩部分，
       50% 透明 50% 填充顏色 (可根據需求調整) */
  background: linear-gradient(to top right, transparent 50%, var(--md-sys-color-surface-variant) 50%);
  pointer-events: none;
  /* 不影響滑鼠事件 */
}

.tactical__header {
  position: absolute;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-tech-ui);
  color: var(--md-sys-color-on-surface);
  z-index: 10;
  pointer-events: none;
}

.tactical__header--team-number {
  top: calc(var(--space-xl) + var(--space-xs));
  right: calc(var(--space-lg) + var(--space-xs));
  text-align: right;
}

.tactical__header--member {
  bottom: calc(var(--space-xl) + var(--space-xs));
  left: calc(var(--space-lg) + var(--space-xs));
  text-align: left;
}

.tactical__cell--member,
.tactical__cell--team-number {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
  text-align: center;
  font-weight: var(--font-weight-medium);
  font-family: var(--font-family-tech-ui);
  z-index: 10;
  pointer-events: none;
  color: var(--md-sys-color-on-surface);
}

.tactical__cell--member {
  font-size: var(--font-size-xs);
}

.tactical__cell--team-number {
  font-size: var(--font-size-sm);
}
</style>
