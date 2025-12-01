// src/modules/character/ui/components/composables/useCharacterUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type CharacterUseCase from '../../application/CharacterUseCase';

export function useCharacterUseCase() {
    const useCase = inject<CharacterUseCase>(DIKeys.CharacterUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.CharacterUseCase);
    return useCase;
}
