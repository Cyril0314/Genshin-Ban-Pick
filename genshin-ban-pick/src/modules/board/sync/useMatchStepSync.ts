// src/modules/board/sync/useMatchStepSync.ts

import { useSocketStore } from '@/app/stores/socketStore'
import { matchStepUseCase } from '../application/matchStepUseCase'

enum StepEvent {
    AdvanceRequest = 'step.advance.request',
    RollbackRequest = 'step.rollback.request',
    ResetRequest = 'step.reset.request',

    StateSyncSelf = 'step.state.sync.self',
    StateSyncAll = 'step.state.sync.all',
}

export function useMatchStepSync() {
  const socket = useSocketStore().getSocket()
  const { setStepIndex } = matchStepUseCase()

  function registerMatchStepSync() {
        socket.on(`${StepEvent.StateSyncSelf}`, handleStepStateSync)
        socket.on(`${StepEvent.StateSyncAll}`, handleStepStateSync)
    }

  function advanceStep() {
    console.debug('[MATCH STEP SYNC] Sent step advance request')
    socket.emit(`${StepEvent.AdvanceRequest}`)
  }

  function rollbackStep() {
    console.debug('[MATCH STEP SYNC] Sent step rollback request')
    socket.emit(`${StepEvent.RollbackRequest}`)
  }

  function resetStep() {
    console.debug('[MATCH STEP SYNC] Sent step reset request')
    socket.emit(`${StepEvent.ResetRequest}`)
  }

  function handleStepStateSync(newStepIndex: number) {
    console.debug('[MATCH STEP SYNC] Handle step state sync', newStepIndex)
    setStepIndex(newStepIndex)
  }

  return {
    registerMatchStepSync,
    advanceStep,
    rollbackStep,
    resetStep,
  }
}
