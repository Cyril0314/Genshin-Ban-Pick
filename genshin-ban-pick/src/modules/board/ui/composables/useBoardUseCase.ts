// src/modules/board/ui/components/composables/useBoardUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type BoardUseCase from '../../application/BoardUseCase';

export function useBoardUseCase() {
    const useCase = inject<BoardUseCase>(DIKeys.BoardUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.BoardUseCase);
    return useCase;
}
