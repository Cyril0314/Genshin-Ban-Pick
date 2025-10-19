// src/features/BanPick/composables/useBanPickStep.ts

import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted } from 'vue'

import { useSocketStore } from '@/network/socket'
import { useBanPickStepStore } from '@/stores/banPickStepStore'
enum SocketEvent {
  STEP_ADVANCE_REQUEST = 'step.advance.request',
  STEP_ROLLBACK_REQUEST = 'step.rollback.request',
  STEP_RESET_REQUEST = 'step.reset.request',

  STEP_STATE_SYNC_SELF = 'step.state.sync.self',
  STEP_STATE_SYNC_ALL = 'step.state.sync.all',
}

export function useBanPickStep() {
  const socket = useSocketStore().getSocket()
  const banPickStepStore = useBanPickStepStore()
  const { banPickSteps } = storeToRefs(banPickStepStore)
  const { setStepIndex, isCurrentStepZone } = banPickStepStore

  function advanceStep() {
    socket.emit(`${SocketEvent.STEP_ADVANCE_REQUEST}`)
  }

  function rollbackStep() {
    socket.emit(`${SocketEvent.STEP_ROLLBACK_REQUEST}`)
  }

  function resetStep() {
    socket.emit(`${SocketEvent.STEP_RESET_REQUEST}`)
  }

  function handleStepStateSync(newStepIndex: number) {
    setStepIndex(newStepIndex)
  }

  onMounted(() => {
    socket.on(`${SocketEvent.STEP_STATE_SYNC_SELF}`, handleStepStateSync)
    socket.on(`${SocketEvent.STEP_STATE_SYNC_ALL}`, handleStepStateSync)
  })

  onUnmounted(() => {
    socket.off(`${SocketEvent.STEP_STATE_SYNC_SELF}`)
    socket.off(`${SocketEvent.STEP_STATE_SYNC_ALL}`)
  })

  return {
    banPickSteps,
    isCurrentStepZone,
    advanceStep,
    rollbackStep,
    resetStep,
  }
}
