// src/modules/lineup/ui/composables/useLineupUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type LineupUseCase from '../../application/LineupUseCase';

export function useLineupUseCase() {
    const useCase = inject<LineupUseCase>(DIKeys.LineupUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.LineupUseCase);
    return useCase;
}
