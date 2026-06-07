// src/modules/shared/ui/context/playerHistoryContext.ts

import { inject, provide, type InjectionKey } from 'vue';

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export interface PlayerHistoryController {
    open: (identity: PlayerIdentity) => void;
}

export const PlayerHistoryControllerKey: InjectionKey<PlayerHistoryController> = Symbol('PlayerHistoryController');

export function providePlayerHistoryController(controller: PlayerHistoryController) {
    provide(PlayerHistoryControllerKey, controller);
}

export function usePlayerHistoryController(): PlayerHistoryController {
    const ctx = inject(PlayerHistoryControllerKey);
    if (!ctx) throw new Error('[PlayerHistoryController] not provided — ensure providePlayerHistoryController() is called in an ancestor');
    return ctx;
}
