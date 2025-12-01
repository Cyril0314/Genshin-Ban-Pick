// src/modules/board/ui/components/composables/useMatchStepUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type MatchStepUseCase from '../../application/MatchStepUseCase';

export function useMatchStepUseCase() {
    const useCase = inject<MatchStepUseCase>(DIKeys.MatchStepUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.MatchStepUseCase);
    return useCase;
}
