// src/modules/board/sync/useMatchStepSync.ts

import { useSocketStore } from '@/app/stores/socketStore';
import { matchStepUseCase } from '../application/matchStepUseCase';
import { StepEvent } from '@shared/contracts/board/value-types';

export function useMatchStepSync() {
    const socket = useSocketStore().getSocket();
    const { setStepIndex } = matchStepUseCase();

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
        setStepIndex(newStepIndex);
    }

    return {
        registerMatchStepSync,
        fetchMatchStepState,
        advanceStep,
        rollbackStep,
        resetStep,
    };
}
