// src/modules/player/ui/composables/usePlayerUseCase.ts

import { inject } from 'vue';

import type PlayerUseCase from '../../application/PlayerUseCase';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';


export function usePlayerUseCase() {
    const useCase = inject<PlayerUseCase>(DIKeys.PlayerUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.PlayerUseCase);
    return useCase;
}
