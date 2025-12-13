// src/modules/tactical/ui/components/composables/useTacticalUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type TacticalUseCase from '../../application/TacticalUseCase';

export function useTacticalUseCase() {
    const useCase = inject<TacticalUseCase>(DIKeys.TacticalUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.TacticalUseCase);
    return useCase;
}
