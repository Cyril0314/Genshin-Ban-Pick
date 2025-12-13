// src/modules/room/ui/components/composables/useRoomUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type RoomUseCase from '../../application/RoomUseCase';

export function useRoomUseCase() {
    const useCase = inject<RoomUseCase>(DIKeys.RoomUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.RoomUseCase);
    return useCase;
}
