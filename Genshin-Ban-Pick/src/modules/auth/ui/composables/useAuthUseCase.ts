// src/modules/auth/ui/components/composables/useAuthUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type AuthUseCase from '../../application/AuthUseCase';

export function useAuthUseCase() {
    const useCase = inject<AuthUseCase>(DIKeys.AuthUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.AuthUseCase);
    return useCase;
}
