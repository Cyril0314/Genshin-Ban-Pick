<!-- src/features/BanPick/components/StepIndicator.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { BanPickStep } from '@/types/RoomSetting'
import { useSocketStore } from '@/network/socket'
import { useBanPickStep } from '@/features/BanPick/composables/useBanPickStep'

const localStep = ref<BanPickStep | null>(null)
const active = ref(false)
const socket = useSocketStore().getSocket()
const { setStep } = useBanPickStep()

const displayText = computed(() => {
  if (!localStep.value) return '選角結束'
  const input = `${localStep.value.zoneId}`
  const output = input
  .replace(/^zone-ban-(\d+)$/, 'Ban $1')
  .replace(/^zone-pick-(\d+)$/, 'Pick $1')
  .replace(/^zone-utility-(\d+)$/, 'Utility $1')

  return `輪到 ${localStep.value.player}\n選擇 ${output} 角色`
})

function updateStep(step: BanPickStep | null) {
  // 給自己顯示用
  localStep.value = step

  // 更新全域 step 狀態
  setStep(step)

  // 動畫觸發
  active.value = true
  setTimeout(() => (active.value = false), 1200)
}

onMounted(() => {
  socket.on('step.state.sync', updateStep)
  socket.on('step.state.broadcast', updateStep)
})

onUnmounted(() => {
  socket.off('step.state.sync', updateStep)
  socket.off('step.state.broadcast', updateStep)
})
</script>

<template>
  <div class="step-indicator" :class="[
       { active },
       localStep?.player === 'Team Aether' ? 'team-aether' : 
       localStep?.player === 'Team Lumine' ? 'team-lumine' : ''
     ]">
    {{ displayText }}
  </div>
</template>

<style scoped>
.step-indicator {
  background-color: var(--md-sys-color-surface-container-highest-alpha);
  color: var(--md-sys-color-on-surface);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-tech-title);
  text-align: center;
  width: var(--size-step-indicator);
  padding: var(--space-sm) var(--space-xs);
  border-radius: var(--border-radius-xs);
  backdrop-filter: var(--backdrop-filter);
  white-space: pre-line;
  transition: all 0.3s ease;
  animation: steadyGlow 2s ease-in-out infinite alternate;
}

/* 預設沒有光 */
.step-indicator {
  box-shadow: none;
}

.step-indicator.team-aether {
  --glow-color: var(--md-sys-color-secondary-container);
}

.step-indicator.team-lumine {
  --glow-color: var(--md-sys-color-tertiary-container);
}

.step-indicator.active {
  animation: indicatorPulse 1.2s ease-in-out 1, steadyGlow 2s ease-in-out infinite alternate;
}

@keyframes indicatorPulse {
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.95; }
}

@keyframes steadyGlow {
  0% {
    box-shadow: 0 0 8px 2px var(--glow-color);
  }
  100% {
    box-shadow: 0 0 12px 4px var(--glow-color);
  }
}
</style>
