// src/modules/board/registerBoardDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import BoardUseCase from './application/BoardUseCase';
import MatchStepUseCase from './application/MatchStepUseCase';

import type { App } from 'vue';
import type { useBoardImageStore } from './store/boardImageStore';
import type { useMatchStepStore } from './store/matchStepStore';

export function registerBoardDependencies(app: App, boardImageStore: ReturnType<typeof useBoardImageStore>, matchStepStore: ReturnType<typeof useMatchStepStore>) {
    const boardUseCase = new BoardUseCase(boardImageStore);
    app.provide(DIKeys.BoardUseCase, boardUseCase);

    const matchStepUseCase = new MatchStepUseCase(matchStepStore);
    app.provide(DIKeys.MatchStepUseCase, matchStepUseCase);
}
