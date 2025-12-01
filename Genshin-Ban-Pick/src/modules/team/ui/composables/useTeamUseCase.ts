// src/modules/team/ui/components/composables/useTeamUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type TeamUseCase from '../../application/TeamUseCase';

export function useTeamUseCase() {
    const useCase = inject<TeamUseCase>(DIKeys.TeamUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.TeamUseCase);
    return useCase;
}
