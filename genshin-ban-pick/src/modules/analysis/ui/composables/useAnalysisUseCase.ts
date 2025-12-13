// src/modules/analysis/ui/components/composables/useAnalysisUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type AnalysisUseCase from '../../application/AnalysisUseCase';

export function useAnalysisUseCase() {
    const useCase = inject<AnalysisUseCase>(DIKeys.AnalysisUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.AnalysisUseCase);
    return useCase;
}
