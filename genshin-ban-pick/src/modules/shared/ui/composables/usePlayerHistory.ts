// src/modules/shared/ui/composables/usePlayerHistory.ts
//
// PlayerHistory 開窗器：跨 feature 共用的 inject 介面。
// - 介面（key + context）住在 shared，誰都能 inject。
// - 實作（modal 本體）住在 analysis，由 composition root（BanPickView）provide。
// - 這樣 user/team/room/chat 等 feature 只依賴 shared，不再橫向依賴 analysis。

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
