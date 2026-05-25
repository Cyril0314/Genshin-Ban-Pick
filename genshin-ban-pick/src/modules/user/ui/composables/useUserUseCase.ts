// src/modules/user/ui/composables/useUserUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type UserUseCase from '../../application/UserUseCase';

export function useUserUseCase() {
    const useCase = inject<UserUseCase>(DIKeys.UserUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.UserUseCase);
    return useCase;
}
