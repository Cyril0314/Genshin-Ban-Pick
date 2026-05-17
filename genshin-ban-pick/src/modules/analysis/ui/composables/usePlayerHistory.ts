// src/modules/analysis/ui/composables/usePlayerHistory.ts
//
// PlayerHistory 開窗器：由 ancestor（BanPickView）注入 `open(identity)` 函式。
// displayName 由 backend resolve 後跟著 IPlayerRecord 一起回來，caller 只需識別身分。

import { inject, provide, type InjectionKey } from 'vue';

import type { PlayerIdentity } from '@shared/contracts/player/PlayerIdentity';

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
