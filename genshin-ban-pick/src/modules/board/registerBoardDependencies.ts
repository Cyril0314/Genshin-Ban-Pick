// src/modules/board/registerBoardDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import BoardUseCase from './application/BoardUseCase';

import type { App } from 'vue';
import type { useBoardStore } from './store/boardStore';

export function registerBoardDependencies(app: App, boardStore: ReturnType<typeof useBoardStore>) {
    const boardUseCase = new BoardUseCase(boardStore);
    app.provide(DIKeys.BoardUseCase, boardUseCase);
}
