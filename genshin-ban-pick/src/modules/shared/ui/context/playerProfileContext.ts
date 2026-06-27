// src/modules/shared/ui/context/playerProfileContext.ts

import { inject, provide, type InjectionKey } from 'vue';

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export interface PlayerProfileController {
    open: (identity: PlayerIdentity) => void;
}

export const PlayerProfileControllerKey: InjectionKey<PlayerProfileController> = Symbol('PlayerProfileController');

export function providePlayerProfileController(controller: PlayerProfileController) {
    provide(PlayerProfileControllerKey, controller);
}

export function usePlayerProfileController(): PlayerProfileController {
    const ctx = inject(PlayerProfileControllerKey);
    if (!ctx) throw new Error('[PlayerProfileController] not provided — ensure providePlayerProfileController() is called in an ancestor');
    return ctx;
}
