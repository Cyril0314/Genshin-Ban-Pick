// src/modules/board/sync/useMatchStepSync.ts

import { useSocketStore } from '@/app/stores/socketStore';
import { StepEvent } from '@shared/contracts/board/value-types';
import { useMatchStepUseCase } from '../ui/composables/useMatchStepUseCase';

export function useMatchStepSync() {
    const socket = useSocketStore().getSocket();
    const matchStepUseCase = useMatchStepUseCase();

    function registerMatchStepSync() {
        socket.on(`${StepEvent.StateSyncSelf}`, handleStepStateSync);
        socket.on(`${StepEvent.StateSyncAll}`, handleStepStateSync);
    }

    function fetchMatchStepState() {
        console.debug('[MATCH STEP SYNC] Sent match step state request');
        socket.emit(`${StepEvent.StateRequest}`);
    }

    function advanceStep() {
        console.debug('[MATCH STEP SYNC] Sent step advance request');
        socket.emit(`${StepEvent.AdvanceRequest}`);
    }

    function rollbackStep() {
        console.debug('[MATCH STEP SYNC] Sent step rollback request');
        socket.emit(`${StepEvent.RollbackRequest}`);
    }

    function resetStep() {
        console.debug('[MATCH STEP SYNC] Sent step reset request');
        socket.emit(`${StepEvent.ResetRequest}`);
    }

    function handleStepStateSync(newStepIndex: number) {
        console.debug('[MATCH STEP SYNC] Handle step state sync', newStepIndex);
        matchStepUseCase.setStepIndex(newStepIndex);
    }

    return {
        registerMatchStepSync,
        fetchMatchStepState,
        advanceStep,
        rollbackStep,
        resetStep,
    };
}
