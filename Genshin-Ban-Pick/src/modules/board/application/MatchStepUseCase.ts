// src/modules/board/application/MatchStepUseCase.ts

import { useMatchStepStore } from "../store/matchStepStore";

import type { IMatchStep } from '@shared/contracts/match/IMatchStep';

export default class MatchStepUseCase {
    constructor(private matchStepStore: ReturnType<typeof useMatchStepStore>) {}

    initMatchSteps(matchSteps: IMatchStep[]) {
        this.matchStepStore.initMatchSteps(matchSteps);
    }

    setStepIndex(index: number) {
        this.matchStepStore.setStepIndex(index)
    }
}