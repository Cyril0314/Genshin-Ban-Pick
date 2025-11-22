// src/modules/board/application/matchStepUseCase.ts

import { useMatchStepStore } from "../store/matchStepStore";

import type { IMatchStep } from "../types/IMatchFlow";

export function matchStepUseCase() {
    const matchStepStore = useMatchStepStore();

    function initMatchSteps(matchSteps: IMatchStep[]) {
        matchStepStore.initMatchSteps(matchSteps);
    }

    function setStepIndex(index: number) {
        matchStepStore.setStepIndex(index)
    }

    return {
        initMatchSteps,
        setStepIndex
    }
}