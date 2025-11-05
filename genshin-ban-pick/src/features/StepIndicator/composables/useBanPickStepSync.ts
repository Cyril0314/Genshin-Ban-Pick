// src/features/StepIndicator/composables/useBanPickStepSync.ts

import { storeToRefs } from 'pinia'

import { useSocketStore } from '@/stores/socketStore'
import { useBanPickStepStore } from '@/stores/banPickStepStore'

enum SocketEvent {
  STEP_ADVANCE_REQUEST = 'step.advance.request',
  STEP_ROLLBACK_REQUEST = 'step.rollback.request',
  STEP_RESET_REQUEST = 'step.reset.request',

  STEP_STATE_SYNC_SELF = 'step.state.sync.self',
  STEP_STATE_SYNC_ALL = 'step.state.sync.all',
}

export function useBanPickStepSync() {
  const socket = useSocketStore().getSocket()
  const banPickStepStore = useBanPickStepStore()
  const { currentStep, banPickSteps } = storeToRefs(banPickStepStore)
  const { setStepIndex } = banPickStepStore

  function registerBanPickStepSync() {
        socket.on(`${SocketEvent.STEP_STATE_SYNC_SELF}`, handleStepStateSync)
        socket.on(`${SocketEvent.STEP_STATE_SYNC_ALL}`, handleStepStateSync)
    }

  function advanceStep() {
    console.debug('[BP STEP SYNC] Sent step advance request')
    socket.emit(`${SocketEvent.STEP_ADVANCE_REQUEST}`)
  }

  function rollbackStep() {
    console.debug('[BP STEP SYNC] Sent step rollback request')
    socket.emit(`${SocketEvent.STEP_ROLLBACK_REQUEST}`)
  }

  function resetStep() {
    console.debug('[BP STEP SYNC] Sent step reset request')
    socket.emit(`${SocketEvent.STEP_RESET_REQUEST}`)
  }

  function handleStepStateSync(newStepIndex: number) {
    console.debug('[BP STEP SYNC] Handle step state sync', newStepIndex)
    setStepIndex(newStepIndex)
  }

  return {
    currentStep,
    banPickSteps,
    registerBanPickStepSync,
    advanceStep,
    rollbackStep,
    resetStep,
  }
}
