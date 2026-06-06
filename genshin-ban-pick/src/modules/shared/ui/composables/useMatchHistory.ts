// src/modules/shared/ui/composables/useMatchHistory.ts

import { inject, provide, type InjectionKey } from 'vue';

export interface MatchHistoryContext {
    open: (matchId: number) => void;
}

export const MatchHistoryKey: InjectionKey<MatchHistoryContext> = Symbol('MatchHistory');

export function provideMatchHistory(context: MatchHistoryContext) {
    provide(MatchHistoryKey, context);
}

export function useMatchHistory(): MatchHistoryContext {
    const ctx = inject(MatchHistoryKey);
    if (!ctx) throw new Error('[MatchHistory] context not provided — ensure provideMatchHistory() is called in an ancestor');
    return ctx;
}
