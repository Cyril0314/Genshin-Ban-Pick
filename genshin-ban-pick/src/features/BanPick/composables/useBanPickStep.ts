// src/features/BanPick/composables/useBanPickStep.ts

import { ref, computed } from 'vue'
import { useSocketStore } from '@/network/socket'
import type { IBanPickStep } from '@/types/IBanPickStep'
import type { IRoomSetting } from '@/types/IRoomSetting'

const currentStep = ref<IBanPickStep | null>(null)
let initialized = false

export function useBanPickStep() {
  const socket = useSocketStore().getSocket()

    if (!initialized) {
    socket.on('step.state.sync', (step: IBanPickStep | null) => {
      currentStep.value = step
    })
    socket.on('step.state.broadcast', (step: IBanPickStep | null) => {
      currentStep.value = step
    })
    initialized = true
  }

  function setStep(step: IBanPickStep | null) {
    currentStep.value = step
  }

  function isCurrentStepZone(zoneId: string) {
    return zoneId === currentStep.value?.zoneId
  }

  function advanceStep() {
    socket.emit('step.advance.request', { senderId: socket.id })
  }

  function rollbackStep() {
    socket.emit('step.rollback.request', { senderId: socket.id })
  }

  function resetStep() {
    socket.emit('step.reset.request', { senderId: socket.id })
  }

  return {
    currentStep,
    isCurrentStepZone,
    setStep,
    advanceStep,
    rollbackStep,
    resetStep,
  }
}
