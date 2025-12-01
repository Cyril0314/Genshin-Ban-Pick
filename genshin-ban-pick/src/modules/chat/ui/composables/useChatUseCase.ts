// src/modules/chat/ui/components/composables/useChatUseCase.ts

import { inject } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';
import { DependencyNotProvided } from '@/app/errors/AppError';

import type ChatUseCase from '../../application/ChatUseCase';

export function useChatUseCase() {
    const useCase = inject<ChatUseCase>(DIKeys.ChatUseCase);
    if (!useCase) throw new DependencyNotProvided(DIKeys.ChatUseCase);
    return useCase;
}
