// src/modules/genshinVersion/ui/components/composables/useGenshinVersionUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type GenshinVersionUseCase from '../../application/GenshinVersionUseCase';

export function useGenshinVersionUseCase() {
    const useCase = inject<GenshinVersionUseCase>(DIKeys.GenshinVersionUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.GenshinVersionUseCase);
    return useCase;
}
