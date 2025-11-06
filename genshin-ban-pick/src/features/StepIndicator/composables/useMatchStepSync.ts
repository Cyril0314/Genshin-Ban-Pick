// src/features/StepIndicator/composables/useMatchStepSync.ts

import { storeToRefs } from 'pinia'

import { useSocketStore } from '@/stores/socketStore'
import { useMatchStepStore } from '@/stores/matchStepStore'

enum StepEvent {
    AdvanceRequest = 'step.advance.request',
    RollbackRequest = 'step.rollback.request',
    ResetRequest = 'step.reset.request',

    StateSyncSelf = 'step.state.sync.self',
    StateSyncAll = 'step.state.sync.all',
}

export function useMatchStepSync() {
  const socket = useSocketStore().getSocket()
  const matchStepStore = useMatchStepStore()
  const { currentStep, matchSteps } = storeToRefs(matchStepStore)
  const { setStepIndex } = matchStepStore

  function registerMatchStepSync() {
        socket.on(`${StepEvent.StateSyncSelf}`, handleStepStateSync)
        socket.on(`${StepEvent.StateSyncAll}`, handleStepStateSync)
    }

  function advanceStep() {
    console.debug('[BP STEP SYNC] Sent step advance request')
    socket.emit(`${StepEvent.AdvanceRequest}`)
  }

  function rollbackStep() {
    console.debug('[BP STEP SYNC] Sent step rollback request')
    socket.emit(`${StepEvent.RollbackRequest}`)
  }

  function resetStep() {
    console.debug('[BP STEP SYNC] Sent step reset request')
    socket.emit(`${StepEvent.ResetRequest}`)
  }

  function handleStepStateSync(newStepIndex: number) {
    console.debug('[BP STEP SYNC] Handle step state sync', newStepIndex)
    setStepIndex(newStepIndex)
  }

  return {
    currentStep,
    matchSteps,
    registerMatchStepSync,
    advanceStep,
    rollbackStep,
    resetStep,
  }
}
