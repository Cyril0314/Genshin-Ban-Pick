// src/modules/lineup/registerLineupDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import LineupUseCase from './application/LineupUseCase';

import type { App } from 'vue';
import type { useLineupStore } from './store/lineupStore';

export function registerLineupDependencies(app: App, lineupStore: ReturnType<typeof useLineupStore>) {
    const lineupUseCase = new LineupUseCase(lineupStore);
    app.provide(DIKeys.LineupUseCase, lineupUseCase);
}
