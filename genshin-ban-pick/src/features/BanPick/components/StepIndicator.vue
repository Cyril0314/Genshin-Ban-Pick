<!-- src/features/BanPick/components/StepIndicator.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { BanPickStep } from '@/types/RoomSetting'
import { useInjectedSocket } from '@/network/SocketProvider'
import { useBanPickStep } from '@/features/BanPick/composables/useBanPickStep'

const localStep = ref<BanPickStep | null>(null)
const active = ref(false)
const socket = useInjectedSocket()
const { setStep } = useBanPickStep()

const displayText = computed(() => {
  if (!localStep.value) return '選角結束'
  return `現在輪到 ${localStep.value.player}\n選擇 ${localStep.value.zoneId} 角色`
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
  <div id="step-indicator" :class="{ active }">
    {{ displayText }}
  </div>
</template>

<style scoped>
#step-indicator {
  background-color: rgba(255, 255, 255, 0.2);
  color: #4e4040;
  font-size: 1.5em;
  font-weight: bold;
  text-align: center;
  width: fit-content;
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  white-space: pre-line;
  transition: all 0.3s ease;
}

#step-indicator.active {
  animation: indicatorPulse 1.2s ease-in-out 1;
}

@keyframes indicatorPulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 0.95;
  }
}
</style>
