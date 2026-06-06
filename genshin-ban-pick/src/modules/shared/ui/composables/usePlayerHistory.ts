// src/modules/shared/ui/composables/usePlayerHistory.ts

import { inject, provide, type InjectionKey } from 'vue';

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export interface PlayerHistoryContext {
    open: (identity: PlayerIdentity) => void;
}

export const PlayerHistoryKey: InjectionKey<PlayerHistoryContext> = Symbol('PlayerHistory');

export function providePlayerHistory(context: PlayerHistoryContext) {
    provide(PlayerHistoryKey, context);
}

export function usePlayerHistory(): PlayerHistoryContext {
    const ctx = inject(PlayerHistoryKey);
    if (!ctx) throw new Error('[PlayerHistory] context not provided — ensure providePlayerHistory() is called in an ancestor');
    return ctx;
}
