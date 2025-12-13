// src/modules/tactical/registerTacticalDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import TacticalUseCase from './application/TacticalUseCase';

import type { App } from 'vue';
import type { useTacticalBoardStore } from './store/tacticalBoardStore';

export function registerTacticalDependencies(app: App, tacticalBoardStore: ReturnType<typeof useTacticalBoardStore>) {
    const tacticalUseCase = new TacticalUseCase(tacticalBoardStore);
    app.provide(DIKeys.TacticalUseCase, tacticalUseCase);
}
