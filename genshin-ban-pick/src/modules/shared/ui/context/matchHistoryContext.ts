// src/modules/shared/ui/context/matchHistoryContext.ts

import { inject, provide, type InjectionKey } from 'vue';

export interface MatchHistoryController {
    open: (matchId: number) => void;
}

export const MatchHistoryControllerKey: InjectionKey<MatchHistoryController> = Symbol('MatchHistoryController');

export function provideMatchHistoryController(controller: MatchHistoryController) {
    provide(MatchHistoryControllerKey, controller);
}

export function useMatchHistoryController(): MatchHistoryController {
    const ctx = inject(MatchHistoryControllerKey);
    if (!ctx) throw new Error('[MatchHistoryController] not provided — ensure provideMatchHistoryController() is called in an ancestor');
    return ctx;
}
