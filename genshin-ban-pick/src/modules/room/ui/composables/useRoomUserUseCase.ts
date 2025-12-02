// src/modules/room/ui/components/composables/useRoomUserUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type RoomUserUseCase from '../../application/RoomUserUseCase';

export function useRoomUserUseCase() {
    const useCase = inject<RoomUserUseCase>(DIKeys.RoomUserUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.RoomUserUseCase);
    return useCase;
}
