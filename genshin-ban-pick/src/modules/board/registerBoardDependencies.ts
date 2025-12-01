// src/modules/board/registerBoardDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import BoardUseCase from './application/BoardUseCase';

import type { App } from 'vue';
import type { useBoardImageStore } from './store/boardImageStore';

export function registerBoardDependencies(app: App, boardImageStore: ReturnType<typeof useBoardImageStore>) {
    const boardUseCase = new BoardUseCase(boardImageStore);
    app.provide(DIKeys.BoardUseCase, boardUseCase);
}
