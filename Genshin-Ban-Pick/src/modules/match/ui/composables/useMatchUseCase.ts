// src/modules/match/ui/components/composables/useMatchUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type MatchUseCase from '../../application/MatchUseCase';

export function useMatchUseCase() {
    const useCase = inject<MatchUseCase>(DIKeys.MatchUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.MatchUseCase);
    return useCase;
}
